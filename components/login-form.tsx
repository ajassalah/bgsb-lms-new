"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
function timeout<T>(promise: PromiseLike<T>, ms = 15000): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(new Error("The login request timed out. Please try again.")),
        ms,
      ),
    ),
  ]);
}
export function LoginForm() {
  const [busy, setBusy] = useState(false),
    [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    if (
      new URLSearchParams(window.location.search).get("session") === "expired"
    ) {
      toast.error(
        "Your session expired after 30 minutes of inactivity. Please sign in again.",
      );
      history.replaceState(null, "", "/login");
    }
  }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const form = new FormData(e.currentTarget),
      email = String(form.get("email") || "").trim(),
      password = String(form.get("password") || "");
    try {
      const response = await timeout(
        fetch("/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email, password }),
        }),
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to sign in");
      await fetch("/api/login-history", { method: "POST" }).catch(() => null);
      localStorage.setItem("bgsb-last-activity", String(Date.now()));
      toast.success("Signed in successfully");
      window.location.replace(result.route);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
      setBusy(false);
    }
  }
  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <p className="font-bold uppercase tracking-[.2em] text-red">
          Welcome back
        </p>
        <h1 className="mt-2 text-4xl font-bold text-navy">Sign in to BGSB</h1>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <label className="block text-sm font-semibold">
          Email
          <input
            className="field mt-2"
            name="email"
            type="email"
            autoComplete="email"
            disabled={busy}
            required
          />
        </label>
        <label className="block text-sm font-semibold">
          Password
          <span className="relative mt-2 block">
            <input
              className="field pr-12"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={busy}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-slate-500"
            >
              {showPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          </span>
        </label>
        <div className="flex justify-end">
          <a href="/password-forgot" className="text-sm font-semibold text-red">
            Forgot password?
          </a>
        </div>
        <button
          disabled={busy}
          className="btn-primary w-full disabled:cursor-wait disabled:opacity-70"
        >
          {busy ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Signing in…
            </span>
          ) : (
            "Login"
          )}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-slate-500">
        Accounts are issued by BGSB. Public registration is not available.
      </p>
    </div>
  );
}
