"use client";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { AuthHeader, authButton, authInput, authLabel } from "./auth-layout";

/** "Can't log in?" — requests a password reset email. */
export function ResetForm() {
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const email = String(new FormData(event.currentTarget).get("email") || "").trim();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/password-forgot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Unable to send the reset link");
      setSentTo(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send the reset link");
    } finally {
      setBusy(false);
    }
  }

  if (sentTo)
    return (
      <div className="w-full text-center">
        <AuthHeader title="Check your inbox" />
        <span className="mx-auto mt-6 grid size-14 place-items-center rounded-full bg-[#DEEBFF] text-[#0052CC]">
          <MailCheck aria-hidden className="size-7" />
        </span>
        <p className="mt-5 text-sm leading-6 text-[#42526E]">
          If an account exists for <b className="font-semibold text-[#172B4D]">{sentTo}</b>,
          we&apos;ve sent a link to reset your password. It can be used once.
        </p>
        <p className="mt-3 text-xs leading-5 text-[#6B778C]">
          Didn&apos;t get it? Check your spam folder, or try again in a minute.
        </p>
        <button type="button" onClick={() => setSentTo(null)} className="mt-5 text-sm text-[#0052CC] hover:underline">
          Resend link
        </button>
        <div className="mt-6 border-t border-[#DFE1E6] pt-5 text-sm">
          <a href="/login" className="text-[#0052CC] hover:underline">
            Return to log in
          </a>
        </div>
      </div>
    );

  return (
    <div className="w-full">
      <AuthHeader title="Can't log in?" />
      <p className="mt-3 text-center text-sm leading-6 text-[#42526E]">
        Enter your account email and we&apos;ll send you a link to reset your password.
      </p>
      {error && (
        <div role="alert" className="mt-5 rounded-[3px] bg-[#FFEBE6] p-3 text-sm text-[#172B4D]">
          {error}
        </div>
      )}
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div>
          <label htmlFor="reset-email" className={authLabel}>
            Email
          </label>
          <input
            id="reset-email"
            className={authInput}
            name="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            disabled={busy}
            required
          />
        </div>
        <button disabled={busy} className={authButton}>
          {busy ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <div className="mt-6 border-t border-[#DFE1E6] pt-5 text-center text-sm">
        <a href="/login" className="text-[#0052CC] hover:underline">
          Return to log in
        </a>
      </div>
    </div>
  );
}
