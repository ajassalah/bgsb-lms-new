"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Eye, EyeOff } from "lucide-react";
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
    [showPassword, setShowPassword] = useState(false),
    [sessionExpired, setSessionExpired] = useState(false);
  useEffect(() => {
    if (
      new URLSearchParams(window.location.search).get("session") === "expired"
    ) {
      setSessionExpired(true);
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
  const input =
    "h-10 w-full rounded-[3px] border-2 border-[#DFE1E6] bg-[#FAFBFC] px-2 text-sm text-[#172B4D] outline-none transition-colors placeholder:text-[#7A869A] hover:bg-[#EBECF0] focus:border-[#4C9AFF] focus:bg-white disabled:cursor-not-allowed disabled:bg-[#F4F5F7] disabled:text-[#A5ADBA]";
  const label = "mb-1 block text-xs font-semibold text-[#6B778C]";
  return (
    <div className="w-full">
      <div className="text-center">
        <img
          src="/bgs logo.png"
          alt="BGSB"
          className="mx-auto h-12 w-auto object-contain"
        />
        <h1
          className="mt-6 text-base font-semibold text-[#5E6C84]"
          style={{ fontFamily: "var(--font-ui), system-ui, sans-serif", letterSpacing: "normal" }}
        >
          Log in to continue
        </h1>
      </div>
      {sessionExpired && (
        <div
          role="alert"
          className="mt-5 flex gap-3 rounded-[3px] bg-[#FFFAE6] p-3 text-sm text-[#172B4D]"
        >
          <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 fill-[#FF8B00] text-[#FFFAE6]" />
          <span>
            Your session expired after 30 minutes of inactivity. Please log in
            again.
          </span>
        </div>
      )}
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div>
          <label htmlFor="login-email" className={label}>
            Email
          </label>
          <input
            id="login-email"
            className={input}
            name="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            disabled={busy}
            required
          />
        </div>
        <div>
          <label htmlFor="login-password" className={label}>
            Password
          </label>
          <span className="relative block">
            <input
              id="login-password"
              className={`${input} pr-10`}
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              autoComplete="current-password"
              disabled={busy}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-[3px] text-[#6B778C] hover:bg-[#091E420F] hover:text-[#42526E]"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </span>
        </div>
        <button
          disabled={busy}
          className="flex h-10 w-full items-center justify-center rounded-[3px] bg-[#0052CC] text-sm font-medium text-white transition-colors hover:bg-[#0065FF] active:bg-[#0747A6] disabled:cursor-wait disabled:bg-[#091E420F] disabled:text-[#A5ADBA]"
        >
          {busy ? (
            <span className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-[#A5ADBA]/40 border-t-[#6B778C]" />
              Logging in…
            </span>
          ) : (
            "Log in"
          )}
        </button>
      </form>
      <div className="mt-6 border-t border-[#DFE1E6] pt-5 text-center text-sm">
        <a href="/password-forgot" className="text-[#0052CC] hover:underline">
          Can&apos;t log in?
        </a>
        <p className="mt-2 text-xs leading-5 text-[#6B778C]">
          Accounts are issued by BGSB. Public registration is not available.
        </p>
      </div>
    </div>
  );
}
