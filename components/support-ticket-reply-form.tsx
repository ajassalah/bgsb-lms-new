"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { CourseEditor } from "./course-editor";
import { useIsStaffPortal } from "./staff-permission-context";

export function SupportTicketReplyForm({
  ticket,
  initialStatus,
}: {
  ticket: {
    id: string;
    subject: string;
    priority: "low" | "medium" | "high";
  };
  initialStatus: "closed" | "answered";
}) {
  const basePath = useIsStaffPortal()
    ? "/dashboard/admin-staff/support/tickets"
    : "/dashboard/super-admin/support/tickets";
  const [response, setResponse] = useState(""),
    [file, setFile] = useState(""),
    [busy, setBusy] = useState(false),
    router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (response.replace(/<[^>]*>/g, "").trim().length < 2)
      return toast.error("Enter a response");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    form.set("response", response);
    const res = await fetch(`/api/admin/support-tickets/${ticket.id}/reply`, {
      method: "POST",
      body: form,
    });
    if (res.ok) {
      toast.success("Ticket response submitted");
      router.push(basePath);
      router.refresh();
    } else {
      toast.error(
        (await res.json().catch(() => ({}))).error || "Response failed",
      );
      setBusy(false);
    }
  }
  const priorityColor = {
    low: "bg-slate-100 text-slate-600",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red/10 text-red",
  }[ticket.priority];
  return (
    <>
      <button
        onClick={() => router.back()}
        className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500"
      >
        <ArrowLeft className="size-4" />
        Back to Tickets
      </button>
      <p className="text-sm text-slate-400">Support / Tickets / Reply</p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Subject
          </span>
          <h1 className="mt-1 break-words text-2xl font-bold text-navy">
            {ticket.subject}
          </h1>
        </div>
        <span
          className={`rounded-full px-4 py-2 text-xs font-bold capitalize ${priorityColor}`}
        >
          Priority: {ticket.priority}
        </span>
      </div>
      <form
        onSubmit={submit}
        className="mt-7 space-y-6 rounded-xl border bg-white p-4 sm:p-7"
      >
        <label className="block max-w-sm text-sm font-semibold">
          Status
          <span className="relative mt-2 block">
            <select
              name="status"
              defaultValue={initialStatus}
              className="field appearance-none border-slate-200 bg-slate-50 pr-10 font-semibold text-navy shadow-sm transition focus:border-red focus:bg-white"
              required
            >
              <option value="answered">Answered</option>
              <option value="closed">Close</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-red" />
          </span>
        </label>
        <section>
          <label className="mb-2 block text-sm font-semibold">Response</label>
          <CourseEditor value={response} onChange={setResponse} />
        </section>
        <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50 p-4 text-center">
          <Upload className="mb-2 size-7 text-red" />
          <b className="text-sm text-navy">Upload Response File</b>
          <span className="mt-1 text-xs text-slate-400">
            Click to upload a supporting document
          </span>
          <input
            name="attachment"
            type="file"
            className="mt-3 max-w-full text-xs"
            onChange={(event) => setFile(event.target.files?.[0]?.name || "")}
          />
          {file && (
            <span className="mt-2 text-xs font-semibold text-emerald-600">
              {file}
            </span>
          )}
        </label>
        <div className="flex flex-col-reverse gap-3 min-[380px]:flex-row min-[380px]:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button disabled={busy} className="btn-primary gap-2">
            <Send className="size-4" />
            {busy ? "Submitting..." : "Submit Response"}
          </button>
        </div>
      </form>
    </>
  );
}
