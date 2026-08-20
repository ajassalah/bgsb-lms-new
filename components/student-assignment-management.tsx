"use client";
import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Eye,
  MoreVertical,
  RotateCcw,
  Search,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
export type StudentAssignmentCourse = {
  id: string;
  title: string;
  category: string;
  status: string;
  due: number;
  complete: number;
  resubmit: number;
};
export function StudentAssignmentCourses({
  courses,
}: {
  courses: StudentAssignmentCourse[];
}) {
  const [q, setQ] = useState(""),
    [menu, setMenu] = useState<string | null>(null),
    filtered = courses.filter((x) =>
      x.title.toLowerCase().includes(q.toLowerCase()),
    ),
    totals = courses.reduce(
      (a, x) => ({
        due: a.due + x.due,
        complete: a.complete + x.complete,
        resubmit: a.resubmit + x.resubmit,
      }),
      { due: 0, complete: 0, resubmit: 0 },
    );
  return (
    <>
      <div>
        <p className="text-sm text-slate-400">Learning / Assignments</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">My Assignments</h1>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          [
            "Due Assignment",
            totals.due,
            ClipboardList,
            "text-amber-600 bg-amber-50",
          ],
          [
            "Complete Assignment",
            totals.complete,
            CheckCircle2,
            "text-emerald-600 bg-emerald-50",
          ],
          [
            "Resubmit Assignment",
            totals.resubmit,
            RotateCcw,
            "text-red-600 bg-red-50",
          ],
        ].map(([label, count, Icon, color]: any) => (
          <article
            className="flex flex-col items-center rounded-2xl border bg-white p-5 text-center"
            key={label}
          >
            <span
              className={`grid size-11 place-items-center rounded-xl ${color}`}
            >
              <Icon />
            </span>
            <b className="mt-3 block text-3xl">{count}</b>
            <p>{label}</p>
          </article>
        ))}
      </div>
      <section className="mt-6 overflow-visible rounded-2xl border bg-white">
        <label className="relative m-5 block max-w-lg">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="field pl-10"
            placeholder="Search course assignment..."
          />
        </label>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Course Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((row, i) => (
                <tr key={row.id}>
                  <td className="p-4">{i + 1}</td>
                  <td className="p-4 font-bold text-navy">{row.title}</td>
                  <td className="p-4">{row.category}</td>
                  <td className="p-4 capitalize">{row.status}</td>
                  <td className="relative p-4">
                    <button
                      onClick={() => setMenu(menu === row.id ? null : row.id)}
                      className="ml-auto grid size-9 place-items-center rounded-lg border"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {menu === row.id && (
                      <div className="absolute right-4 top-14 z-[100] w-40 rounded-xl border bg-white p-1 shadow-xl">
                        <Link
                          href={`/dashboard/student/assignments/${row.id}`}
                          className="flex items-center gap-2 px-3 py-2"
                        >
                          <BookOpen className="size-4" />
                          View
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
export type StudentAssignment = {
  id: string;
  moduleNo: number | null;
  title: string;
  start: string;
  due: string;
  submittedAt: string | null;
  status: string;
  fileUrl: string | null;
  description: string | null;
};
export function StudentAssignmentTable({
  courseId,
  courseTitle,
  assignments,
}: {
  courseId: string;
  courseTitle: string;
  assignments: StudentAssignment[];
}) {
  const [rows, setRows] = useState(assignments),
    [selected, setSelected] = useState<StudentAssignment | null>(null),
    [menu, setMenu] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [selectedFileName, setSelectedFileName] = useState("");
  const canSubmit = (row: StudentAssignment) =>
    row.status === "resubmit" ||
    (row.status === "not_submitted" &&
      new Date(row.due).getTime() >= Date.now());
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    const res = await fetch(`/api/student/assignments/${selected.id}`, {
        method: "POST",
        body: new FormData(e.currentTarget),
      }),
      body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast.error(body.error || "Submission failed");
    setRows((x) =>
      x.map((r) =>
        r.id === selected.id
          ? {
              ...r,
              status: "submitted",
              submittedAt: body.submitted_at || new Date().toISOString(),
              fileUrl: body.file_url || r.fileUrl,
              description: body.description ?? r.description,
            }
          : r,
      ),
    );
    setSelected(null);
    setSelectedFileName("");
    toast.success("Assignment submitted");
  }
  return (
    <>
      <div>
        <p className="text-sm text-slate-400">My Assignments / Course</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">{courseTitle}</h1>
      </div>
      <section className="mt-6 overflow-visible rounded-2xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4">Module</th>
                <th className="p-4">Title</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">Deadline</th>
                <th className="p-4">Submitted Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="p-4 font-semibold">
                    {row.moduleNo ? `Module ${row.moduleNo}` : "—"}
                  </td>
                  <td className="p-4 font-bold">{row.title}</td>
                  <td className="p-4">
                    {new Date(row.start).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-4">
                    {new Date(row.due).toLocaleDateString("en-GB")}
                  </td>
                  <td className="p-4">
                    {row.submittedAt
                      ? new Date(row.submittedAt).toLocaleString("en-GB")
                      : "—"}
                  </td>
                  <td className="p-4 capitalize">
                    {row.status.replace("_", " ")}
                  </td>
                  <td className="relative p-4">
                    <button
                      onClick={() => setMenu(menu === row.id ? null : row.id)}
                      className="ml-auto grid size-9 place-items-center rounded-lg border bg-white"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {menu === row.id && (
                      <div className="absolute right-4 top-14 z-[120] w-48 rounded-xl border bg-white p-1 shadow-2xl">
                        {canSubmit(row) && (
                          <button
                            onClick={() => {
                              setSelected(row);
                              setMenu(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-slate-50"
                          >
                            <Upload className="size-4" />
                            {row.status === "not_submitted"
                              ? "Submit"
                              : "Re-submit"}
                          </button>
                        )}
                        <Link
                          href={`/dashboard/student/assignments/${courseId}/${row.id}`}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-50"
                        >
                          <Eye className="size-4" /> View
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {selected && (
        <div className="fixed inset-0 z-[200] bg-black/50">
          <form
            onSubmit={submit}
            className="ml-auto flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl"
          >
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-bold">Submit Assignment</h2>
                <p className="text-sm text-slate-400">{selected.title}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setSelectedFileName("");
                }}
              >
                <X />
              </button>
            </div>
            <label className="mt-7 text-sm font-bold">
              Assignment Name
              <input value={selected.title} readOnly className="field mt-2" />
            </label>
            <label className="mt-5 text-sm font-bold">
              Add Description
              <textarea
                name="description"
                defaultValue={selected.description || ""}
                className="field mt-2 min-h-32"
              />
            </label>
            <label className="relative mt-5 cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition hover:border-blue-400 hover:bg-blue-50/40">
              <Upload className="mx-auto mb-2" />
              Attachment File
              <span className="mt-1 block text-xs font-normal text-slate-400">
                Drag and drop any file here, or click to browse
              </span>
              <input
                name="file"
                type="file"
                className="absolute inset-0 cursor-pointer opacity-0"
                required={selected.status === "resubmit" || !selected.fileUrl}
                onChange={(event) =>
                  setSelectedFileName(event.target.files?.[0]?.name || "")
                }
              />
            </label>
            {selectedFileName && (
              <div className="mt-3 rounded-lg border bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                File attached: {selectedFileName}
              </div>
            )}
            {selected.fileUrl && (
              <a
                href={selected.fileUrl}
                target="_blank"
                className="mt-3 text-sm font-bold text-blue-600"
              >
                View current attachment
              </a>
            )}
            <button disabled={busy} className="btn-primary mt-auto">
              {busy ? "Saving..." : "Save Assignment"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
