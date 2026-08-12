"use client";

import { Edit3, FileText, Trash2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export type StudentAssignmentDetail = {
  assignmentId: string;
  courseId: string;
  courseName: string;
  moduleNo: number | null;
  moduleName: string | null;
  assignmentName: string;
  marks: number | null;
  maxMarks: number;
  submittedAt: string | null;
  reviewStatus: string;
  feedback: string | null;
  description: string | null;
  fileUrl: string | null;
  assignmentFileUrl: string | null;
};

export function StudentAssignmentDetails({
  details,
}: {
  details: StudentAssignmentDetail;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false),
    [deleting, setDeleting] = useState(false),
    [busy, setBusy] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const response = await fetch(
      `/api/student/assignments/${details.assignmentId}`,
      { method: "POST", body: new FormData(event.currentTarget) },
    );
    const body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) return toast.error(body.error || "Update failed");
    toast.success("Assignment updated successfully");
    setEditing(false);
    router.refresh();
  }
  async function remove() {
    setBusy(true);
    const response = await fetch(
      `/api/student/assignments/${details.assignmentId}`,
      { method: "DELETE" },
    );
    const body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) return toast.error(body.error || "Delete failed");
    toast.success("Assignment submission deleted");
    router.push(`/dashboard/student/assignments/${details.courseId}`);
    router.refresh();
  }
  const rows = [
    ["Course Name", details.courseName],
    [
      "Module",
      details.moduleNo
        ? `Module ${details.moduleNo}${details.moduleName ? ` - ${details.moduleName}` : ""}`
        : details.moduleName || "—",
    ],
    ["Assignment Name", details.assignmentName],
    [
      "Marks",
      details.marks === null
        ? `Not graded / ${details.maxMarks}`
        : `${details.marks} / ${details.maxMarks}`,
    ],
    [
      "Submitted Status",
      details.submittedAt
        ? `Submitted on ${new Date(details.submittedAt).toLocaleString("en-GB")}`
        : "Not Submitted",
    ],
    ["Review Status", details.reviewStatus.replace("_", " ")],
    ["Feedback", details.feedback || "No feedback yet"],
  ];
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">My Assignments / View</p>
          <h1 className="mt-1 text-2xl font-bold text-navy">
            Assignment Details
          </h1>
        </div>
        {details.submittedAt && details.reviewStatus !== "accepted" && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="btn-secondary gap-2"
            >
              <Edit3 className="size-4" />
              Edit
            </button>
            <button
              onClick={() => setDeleting(true)}
              className="btn-primary gap-2"
            >
              <Trash2 className="size-4" />
              Delete
            </button>
          </div>
        )}
      </div>
      {details.assignmentFileUrl && (
        <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <FileText className="size-5" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Assigned Assignment
              </p>
              <h2 className="font-bold text-navy">{details.assignmentName}</h2>
            </div>
          </div>
          <a
            href={details.assignmentFileUrl}
            download
            className="btn-primary gap-2"
          >
            <FileText className="size-4" />
            Download
          </a>
        </section>
      )}
      <section className="mt-6 overflow-hidden rounded-2xl border bg-white">
        <div className="grid md:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="border-b p-5 md:odd:border-r">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {label}
              </p>
              <p className="mt-2 font-semibold capitalize">{value}</p>
            </div>
          ))}
        </div>
        {details.fileUrl && (
          <div className="p-5">
            <a
              href={details.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-bold text-blue-600"
            >
              <FileText className="size-5" />
              Open submitted attachment
            </a>
          </div>
        )}
      </section>
      {editing && (
        <div className="fixed inset-0 z-[220] bg-black/60">
          <form
            onSubmit={save}
            className="ml-auto flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl"
          >
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-bold">Edit Submission</h2>
                <p className="text-sm text-slate-400">
                  {details.assignmentName}
                </p>
              </div>
              <button type="button" onClick={() => setEditing(false)}>
                <X />
              </button>
            </div>
            <label className="mt-7 text-sm font-bold">
              Description
              <textarea
                name="description"
                defaultValue={details.description || ""}
                className="field mt-2 min-h-32"
              />
            </label>
            <label className="relative mt-5 cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition hover:border-blue-400 hover:bg-blue-50/40">
              <Upload className="mx-auto mb-2" />
              Replace Attachment
              <span className="mt-1 block text-xs font-normal text-slate-400">
                Drag and drop any file here, or click to browse
              </span>
              <input
                name="file"
                type="file"
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
            {details.fileUrl && (
              <a
                href={details.fileUrl}
                target="_blank"
                className="mt-3 text-sm font-bold text-blue-600"
              >
                View current attachment
              </a>
            )}
            <button disabled={busy} className="btn-primary mt-auto">
              {busy ? "Saving..." : "Update Assignment"}
            </button>
          </form>
        </div>
      )}
      {deleting && (
        <div className="fixed inset-0 z-[230] grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <Trash2 className="size-10 text-red-600" />
            <h2 className="mt-4 text-xl font-bold">Delete submission?</h2>
            <p className="mt-2 text-sm text-slate-500">
              This will remove your uploaded assignment and submission details.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                disabled={busy}
                onClick={() => setDeleting(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button disabled={busy} onClick={remove} className="btn-primary">
                {busy ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
