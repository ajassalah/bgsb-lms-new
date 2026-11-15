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
      className="ds-terms-dialog w-full max-w-[480px] rounded-[3px] bg-white p-6 shadow-[0_8px_12px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.31)] sm:p-8"
      style={{ fontFamily: "var(--font-ui), system-ui, sans-serif" }}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[3px] bg-[#DEEBFF] text-[#0052CC]">
          <FileText className="size-5" />
        </span>
        <div className="min-w-0">
          <h1
            id="terms-title"
            className="text-xl font-semibold leading-7 text-[#172B4D]"
            style={{ fontFamily: "var(--font-ui), system-ui, sans-serif", letterSpacing: "normal" }}
          >
            Review the Terms &amp; Conditions
          </h1>
          <span className="ds-lozenge mt-1 bg-[#DEEBFF] text-[#0747A6]">Version {version}</span>
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-[#42526E]">
        Welcome to the BGSB Learning Management System. Before you continue,
        please review and accept the British Graduates School of Business LMS
        Terms &amp; Conditions.
      </p>
      <Link
        href="/terms-and-conditions?acceptance=1"
        className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-[3px] bg-[#091E420F] text-sm font-medium text-[#42526E] transition-colors hover:bg-[#091E4224] hover:text-[#172B4D]"
      >
        <FileText className="size-4" /> View Terms &amp; Conditions
      </Link>
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[3px] border-2 border-[#DFE1E6] bg-[#FAFBFC] p-3 text-sm leading-5 text-[#172B4D] transition-colors hover:bg-[#EBECF0]">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-[#0052CC]"
        />
        <span>I have read and agree to the BGSB LMS Terms &amp; Conditions.</span>
      </label>
      <button
        type="button"
        disabled={!accepted || busy}
        onClick={continueToDashboard}
        className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-[3px] bg-[#0052CC] text-sm font-medium text-white transition-colors hover:bg-[#0065FF] active:bg-[#0747A6] disabled:cursor-not-allowed disabled:bg-[#091E420F] disabled:text-[#A5ADBA]"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}
        {busy ? "Saving…" : "Accept & continue"}
      </button>
    </section>
  );
}
