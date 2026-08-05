"use client";
import { useEffect, useState } from "react";
import { CircleHelp } from "lucide-react";
export function GlobalActionConfirmation() {
  const [pending, setPending] = useState<{
    form: HTMLFormElement;
    submitter: HTMLElement | null;
  } | null>(null);
  useEffect(() => {
    const handle = (event: Event) => {
      const submit = event as SubmitEvent,
        form = submit.target as HTMLFormElement;
      if (
        !form?.closest("[data-admin-shell]") ||
        form.dataset.actionConfirmed === "true"
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setPending({ form, submitter: submit.submitter as HTMLElement | null });
    };
    window.addEventListener("submit", handle, true);
    return () => window.removeEventListener("submit", handle, true);
  }, []);
  if (!pending) return null;
  function confirm() {
    const current = pending;
    if (!current) return;
    const { form, submitter } = current;
    form.dataset.actionConfirmed = "true";
    setPending(null);
    queueMicrotask(() => {
      form.requestSubmit(
        submitter instanceof HTMLButtonElement ||
          submitter instanceof HTMLInputElement
          ? submitter
          : undefined,
      );
      delete form.dataset.actionConfirmed;
    });
  }
  return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-black/50 p-3 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-2xl">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-red/10 text-red">
          <CircleHelp className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-bold text-navy">
          Confirm this action?
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Please confirm before creating, updating, or sending this information.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={() => setPending(null)} className="btn-secondary">
            Cancel
          </button>
          <button onClick={confirm} className="btn-primary">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
