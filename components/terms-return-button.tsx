"use client";

import { ArrowLeft } from "lucide-react";

export function TermsReturnButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (window.opener) window.close();
        else window.history.back();
      }}
      className="btn-secondary gap-2"
    >
      <ArrowLeft className="size-4" /> Return to LMS
    </button>
  );
}
