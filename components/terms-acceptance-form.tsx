"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function TermsAcceptanceForm({ version }: { version: string }) {
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  async function continueToDashboard() {
    if (!accepted)
      return toast.error(
        "Please confirm that you have read and agree to the Terms & Conditions before continuing.",
      );
    setBusy(true);
    const response = await fetch("/api/terms/accept", { method: "POST" });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(body.error || "Terms acceptance could not be saved");
      setBusy(false);
      return;
    }
    toast.success("Terms & Conditions accepted");
    window.location.replace(body.route);
  }
  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
      className="w-full max-w-lg rounded-3xl border bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-8"
    >
      <span className="grid size-12 place-items-center rounded-2xl bg-red/10 text-red">
        <FileText className="size-6" />
      </span>
      <p className="mt-5 text-xs font-bold uppercase tracking-widest text-red">
        Current version {version}
      </p>
      <h1
        id="terms-title"
        className="mt-2 text-2xl font-black text-navy dark:text-white"
      >
        Terms & Conditions
      </h1>
      <h2 className="mt-2 font-semibold text-slate-700 dark:text-slate-200">
        Welcome to the BGSB Learning Management System
      </h2>
      <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
        Before accessing the LMS, you are required to review and accept the
        British Graduates School of Business LMS Terms & Conditions.
      </p>
      <Link
        href="/terms-and-conditions?acceptance=1"
        className="btn-secondary mt-5 w-full justify-center gap-2"
      >
        <FileText className="size-4" /> View Terms & Conditions
      </Link>
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
          className="mt-1 size-4 shrink-0 accent-red-600"
        />
        <span>I have read and agree to the BGSB LMS Terms & Conditions.</span>
      </label>
      <button
        type="button"
        disabled={!accepted || busy}
        onClick={continueToDashboard}
        className="btn-primary mt-5 w-full justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}
        {busy ? "Saving…" : "Accept & Continue"}
      </button>
    </section>
  );
}
