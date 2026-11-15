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
      className="inline-flex h-10 items-center gap-2 rounded-[3px] bg-[#091E420F] px-4 text-sm font-medium text-[#42526E] transition-colors hover:bg-[#091E4224] hover:text-[#172B4D]"
    >
      <ArrowLeft className="size-4" /> Return to LMS
    </button>
  );
}
