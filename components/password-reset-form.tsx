"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuthHeader, authButton, authInput, authLabel } from "./auth-layout";

/** Sets a new password from the emailed recovery link (?token_hash=…&type=recovery). */
export function PasswordResetForm() {
  const [tokenHash, setTokenHash] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTokenHash(new URLSearchParams(location.search).get("token_hash"));
    setReady(true);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !tokenHash) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    if (password.length < 8) return setError("Password must contain at least 8 characters.");
    if (password !== confirm) return setError("The passwords don't match.");
    setBusy(true);
    setError(null);
    const db = createClient();
    try {
      const { error: verifyError } = await db.auth.verifyOtp({
        type: "recovery",
        token_hash: tokenHash,
      });
      if (verifyError)
        throw new Error("This reset link is invalid or has expired. Request a new one.");
      const { error: updateError } = await db.auth.updateUser({ password });
      if (updateError) throw new Error(updateError.message);
      await db.auth.signOut();
      toast.success("Password updated. Log in with your new password.");
      location.replace("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update your password.");
      setBusy(false);
    }
  }

  if (!ready) return <AuthHeader title="Choose a new password" />;

  if (!tokenHash)
    return (
      <div className="w-full text-center">
        <AuthHeader title="Reset link not valid" />
        <p className="mt-4 text-sm leading-6 text-[#42526E]">
          Open the link from your reset email, or request a new one.
        </p>
        <a href="/password-forgot" className={`${authButton} mt-6`}>
          Request a new link
        </a>
      </div>
    );

  return (
    <div className="w-full">
      <AuthHeader title="Choose a new password" />
      {error && (
        <div role="alert" className="mt-5 rounded-[3px] bg-[#FFEBE6] p-3 text-sm text-[#172B4D]">
          {error}{" "}
          {error.includes("expired") && (
            <a href="/password-forgot" className="text-[#0052CC] underline">
              Request a new link
            </a>
          )}
        </div>
      )}
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <div>
          <label htmlFor="new-password" className={authLabel}>
            New password
          </label>
          <span className="relative block">
            <input
              id="new-password"
              className={`${authInput} pr-10`}
              name="password"
              type={show ? "text" : "password"}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              disabled={busy}
              required
            />
            <button
              type="button"
              onClick={() => setShow((value) => !value)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-1 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-[3px] text-[#6B778C] hover:bg-[#091E420F] hover:text-[#42526E]"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </span>
        </div>
        <div>
          <label htmlFor="confirm-password" className={authLabel}>
            Confirm new password
          </label>
          <input
            id="confirm-password"
            className={authInput}
            name="confirm"
            type={show ? "text" : "password"}
            placeholder="Re-enter the password"
            autoComplete="new-password"
            disabled={busy}
            required
          />
        </div>
        <button disabled={busy} className={authButton}>
          {busy ? "Saving…" : "Save new password"}
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
