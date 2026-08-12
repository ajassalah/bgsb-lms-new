"use client";
import { useState } from "react";
import { Download, FileSpreadsheet, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function BulkImportDialog({
  label,
  endpoint,
  template,
  extraFields,
}: {
  label: string;
  endpoint: string;
  template: string;
  extraFields?: Record<string, string>;
}) {
  const [open, setOpen] = useState(false),
    [file, setFile] = useState<File | null>(null),
    [busy, setBusy] = useState(false),
    router = useRouter();
  function download() {
    const url = URL.createObjectURL(
        new Blob([template], { type: "text/csv;charset=utf-8" }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = `${label.toLowerCase().replace(/\s+/g, "-")}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) return toast.error("Select a CSV file");
    setBusy(true);
    const form = new FormData();
    form.set("file", file);
    Object.entries(extraFields || {}).forEach(([k, v]) => form.set(k, v));
    const res = await fetch(endpoint, { method: "POST", body: form }),
      body = await res.json();
    setBusy(false);
    if (!res.ok) return toast.error(body.error || "Import failed");
    toast.success(
      `${body.imported || 0} records imported${body.failed ? `, ${body.failed} failed` : ""}`,
    );
    setOpen(false);
    setFile(null);
    router.refresh();
  }
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-secondary gap-2">
        <FileSpreadsheet className="size-4" />
        Bulk Import
      </button>
      {open && (
        <div className="fixed inset-0 z-[240] grid place-items-center bg-black/50 p-3 backdrop-blur-sm">
          <form
            onSubmit={submit}
            className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 grid size-9 place-items-center"
            >
              <X className="size-4" />
            </button>
            <span className="grid size-12 place-items-center rounded-xl bg-red/10 text-red">
              <FileSpreadsheet className="size-6" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-navy">
              Bulk Import {label}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Download the example template, complete its rows, then upload it
              as CSV.
            </p>
            <button
              type="button"
              onClick={download}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold text-navy"
            >
              <Download className="size-4" />
              Download CSV Template
            </button>
            <label className="mt-4 grid min-h-32 cursor-pointer place-items-center rounded-xl border-2 border-dashed p-4 text-center">
              <span>
                <Upload className="mx-auto mb-2 size-6 text-red" />
                <b className="block text-sm text-navy">
                  {file?.name || "Choose CSV file"}
                </b>
                <small className="text-slate-400">Only .csv files</small>
              </span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button disabled={busy || !file} className="btn-primary">
                {busy ? "Importing…" : "Import CSV"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
