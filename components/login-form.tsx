"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { roleLabels, type Role } from "@/lib/types";
import { toast } from "sonner";
const choices = Object.entries(roleLabels) as [Role, string][];
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
  const [role, setRole] = useState<Role>("student"),
    [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    const form = new FormData(e.currentTarget),
      email = String(form.get("email") || "").trim(),
      password = String(form.get("password") || ""),
      db = createClient();
    try {
      const { data, error } = await timeout(
        db.auth.signInWithPassword({ email, password }),
      );
      if (error) throw error;
      const { data: profile, error: profileError } = await timeout(
        db
          .from("profiles")
          .select("role,status")
          .eq("id", data.user.id)
          .single(),
      );
      if (profileError || !profile)
        throw new Error(
          "Your account profile could not be loaded. Please contact BGSB support.",
        );
      if (profile.status !== "active") {
        await db.auth.signOut();
        throw new Error(
          "This account is not active. Please contact BGSB support.",
        );
      }
      if (profile.role !== role) {
        await db.auth.signOut();
        throw new Error(
          `This account is registered as ${roleLabels[profile.role as Role]}. Select the matching login role.`,
        );
      }
      await fetch("/api/login-history", { method: "POST" }).catch(() => null);
      toast.success("Signed in successfully");
      window.location.assign(`/dashboard/${profile.role.replace("_", "-")}`);
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
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2 sm:grid-cols-3">
        {choices.map(([r, label]) => (
          <button
            type="button"
            className={`rounded-xl px-2 py-2 text-xs font-semibold ${role === r ? "bg-white text-navy shadow" : "text-slate-500"}`}
            onClick={() => setRole(r)}
            disabled={busy}
            key={r}
          >
            {label}
          </button>
        ))}
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
          <input
            className="field mt-2"
            name="password"
            type="password"
            autoComplete="current-password"
            disabled={busy}
            required
          />
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
            `Sign in as ${roleLabels[role]}`
          )}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-slate-500">
        Accounts are issued by BGSB. Public registration is not available.
      </p>
    </div>
  );
}
