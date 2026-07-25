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
      className="fixed inset-0 z-[200] grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onCancel}
          aria-label="Close"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
        >
          <X className="size-5" />
        </button>
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-red/10 text-red">
          <Trash2 className="size-6" />
        </span>
        <h2
          id="confirm-title"
          className="mt-4 text-center text-xl font-bold text-navy"
        >
          {title}
        </h2>
        <p className="mt-2 text-center text-sm leading-6 text-slate-500">
          {description}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
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
