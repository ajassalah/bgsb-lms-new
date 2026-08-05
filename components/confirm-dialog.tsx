"use client";
import { Trash2, X } from "lucide-react";
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  busy = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="relative my-auto w-full max-w-sm rounded-xl bg-white p-4 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6">
        <button
          onClick={onCancel}
          aria-label="Close"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
        >
          <X className="size-5" />
        </button>
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-red/10 text-red sm:size-14">
          <Trash2 className="size-6" />
        </span>
        <h2
          id="confirm-title"
          className="mt-3 text-center text-lg font-bold text-navy sm:mt-4 sm:text-xl"
        >
          {title}
        </h2>
        <p className="mt-2 text-center text-sm leading-6 text-slate-500">
          {description}
        </p>
        <div className="mt-6 grid gap-3 min-[380px]:grid-cols-2">
          <button disabled={busy} onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            disabled={busy}
            onClick={onConfirm}
            className="btn-primary bg-red"
          >
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
