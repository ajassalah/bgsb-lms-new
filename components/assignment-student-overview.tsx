"use client";
import { useState } from "react";
import {
  Check,
  Edit3,
  Eye,
  FileText,
  GripVertical,
  MoreVertical,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { ConfirmDialog } from "./confirm-dialog";

type Submission = {
  id: string;
  assignmentId: string;
  title: string;
  fileUrl: string | null;
  submittedAt: string;
  score: number | null;
  grade: string | null;
  maxScore: number;
  description: string | null;
  reviewStatus: string;
};
type Module = {
  id: string;
  title: string;
  position: number;
  submissions: Submission[];
};

export function AssignmentStudentOverview({
  courseId,
  studentId,
  basePath,
  course,
  student,
  modules,
}: {
  courseId: string;
  studentId: string;
  basePath: string;
  course: { title: string; thumbnailUrl: string | null };
  student: { name: string; email: string; avatar: string | null };
  modules: Module[];
}) {
  const [moduleRows, setModuleRows] = useState(modules),
    [selected, setSelected] = useState<Submission | null>(null),
    [busy, setBusy] = useState(false),
    [moduleMenu, setModuleMenu] = useState<string | null>(null),
    [cardMenu, setCardMenu] = useState<string | null>(null),
    [deleting, setDeleting] = useState<Submission | null>(null);
  async function review(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    const form = new FormData(event.currentTarget),
      res = await fetch(
        `/api/admin/assignment-submissions/${selected.id}/review`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            grade: form.get("grade"),
            review_status: form.get("review_status"),
            feedback: form.get("feedback"),
          }),
        },
      ),
      body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast.error(body.error || "Review failed");
    selected.grade = body.grade;
    selected.reviewStatus = body.review_status;
    setSelected(null);
    toast.success("Assignment review saved");
  }
  async function removeSubmission() {
    if (!deleting) return;
    const item = deleting;
    setBusy(true);
    const res = await fetch(
        `/api/admin/assignment-submissions/${item.id}/review`,
        { method: "DELETE" },
      ),
      body = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast.error(body.error || "Delete failed");
    setModuleRows((rows) =>
      rows.map((module) => ({
        ...module,
        submissions: module.submissions.filter(
          (submission) => submission.id !== item.id,
        ),
      })),
    );
    setDeleting(null);
    toast.success("Submitted assignment deleted");
  }
  return (
    <>
      <div>
        <p className="text-sm text-slate-400">
          Assignments / {course.title} / Students
        </p>
        <h1 className="mt-1 text-2xl font-bold text-navy">{student.name}</h1>
        <p className="mt-1 text-sm text-slate-500">{student.email}</p>
      </div>
      <section className="mt-7 overflow-hidden rounded-2xl border bg-white">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-72 w-full bg-slate-50 object-contain p-2 lg:h-96"
          />
        ) : (
          <div className="grid h-56 place-items-center bg-slate-100 text-slate-400">
            No course thumbnail
          </div>
        )}
        <div className="border-t p-5">
          <h2 className="text-xl font-bold text-navy">{course.title}</h2>
        </div>
      </section>
      <div className="mt-7 space-y-5">
        {moduleRows.map((module) => (
          <section key={module.id} className="rounded-xl border bg-white">
            <header className="relative flex items-center gap-4 border-b p-5">
              <GripVertical className="size-6 text-slate-400" />
              <span className="grid size-10 place-items-center rounded-lg bg-navy font-bold text-white">
                {module.position}
              </span>
              <div className="min-w-0 flex-1">
                <small className="font-semibold uppercase text-slate-400">
                  Module No {module.position}
                </small>
                <h2 className="font-bold text-navy">{module.title}</h2>
              </div>
              <button
                onClick={() =>
                  setModuleMenu(moduleMenu === module.id ? null : module.id)
                }
                className="grid size-9 place-items-center rounded-lg border"
              >
                <MoreVertical className="size-4" />
              </button>
              {moduleMenu === module.id && (
                <div className="absolute right-5 top-16 z-[100] w-40 rounded-xl border bg-white p-1 shadow-xl">
                  <Link
                    href={`${basePath}/${courseId}/students/${studentId}/modules/${module.id}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <Eye className="size-4" />
                    View
                  </Link>
                </div>
              )}
            </header>
            <div className="p-5">
              <h3 className="mb-3 text-sm font-bold text-navy">
                Submitted Assignments
              </h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {module.submissions.map((item) => (
                  <article
                    key={item.id}
                    className="relative rounded-xl border bg-amber-50 p-4"
                  >
                    <div className="flex gap-3">
                      <a
                        href={item.fileUrl || "#"}
                        target={item.fileUrl ? "_blank" : undefined}
                        rel="noreferrer"
                        className="flex min-w-0 flex-1 gap-3"
                      >
                        <span className="grid size-9 place-items-center rounded-lg bg-white text-amber-600">
                          <FileText className="size-4" />
                        </span>
                        <div>
                          <b className="text-sm text-navy">{item.title}</b>
                          <p className="mt-1 text-xs text-slate-500">
                            Submitted{" "}
                            {new Date(item.submittedAt).toLocaleString("en-GB")}
                            <br />
                            Grade{" "}
                            {item.grade
                              ? item.grade.replace("_", " ")
                              : "Not graded"}
                            <br />
                            <span className="capitalize">
                              {item.reviewStatus}
                            </span>
                          </p>
                        </div>
                      </a>
                      <button
                        onClick={() =>
                          setCardMenu(cardMenu === item.id ? null : item.id)
                        }
                        className="grid size-8 place-items-center rounded-lg border bg-white"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                      {cardMenu === item.id && (
                        <div className="absolute right-3 top-12 z-[120] w-40 rounded-xl border bg-white p-1 shadow-2xl">
                          <button
                            onClick={() => {
                              setSelected(item);
                              setCardMenu(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                          >
                            <Check className="size-4" />
                            Check
                          </button>
                          <Link
                            href={`${basePath}/${courseId}/students/${studentId}/modules/${module.id}`}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                          >
                            <Edit3 className="size-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              setDeleting(item);
                              setCardMenu(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
                {!module.submissions.length && (
                  <p className="text-sm text-slate-400">
                    No submitted assignments in this module.
                  </p>
                )}
              </div>
            </div>
          </section>
        ))}
        {!moduleRows.length && (
          <div className="rounded-xl border border-dashed bg-white p-12 text-center text-slate-400">
            No modules created for this course.
          </div>
        )}
      </div>
      {selected && (
        <div className="fixed inset-0 z-[220] grid place-items-center bg-black/60 p-4">
          <form
            onSubmit={review}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6"
          >
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-bold">Check Assignment</h2>
                <p className="text-sm text-slate-400">{selected.title}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)}>
                <X />
              </button>
            </div>
            {selected.fileUrl && (
              <div className="mt-5 rounded-xl border bg-slate-50 p-4">
                <a
                  href={selected.fileUrl}
                  target="_blank"
                  className="flex items-center gap-2 font-bold text-blue-600"
                >
                  <FileText className="size-5" />
                  Open uploaded file
                </a>
              </div>
            )}
            {selected.description && (
              <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
                {selected.description}
              </p>
            )}
            <label className="mt-5 block text-sm font-bold">
              Grade
              <select
                name="grade"
                defaultValue={selected.grade || ""}
                className="field mt-2"
                required
              >
                <option value="" disabled>
                  Select grade
                </option>
                <option value="distinction">Distinction</option>
                <option value="pass">Pass</option>
                <option value="credit_pass">Credit Pass</option>
                <option value="fail">Fail</option>
              </select>
            </label>
            <label className="mt-5 block text-sm font-bold">
              Submission Status
              <select disabled className="field mt-2">
                <option>Submitted</option>
              </select>
            </label>
            <label className="mt-5 block text-sm font-bold">
              Review Status
              <select
                name="review_status"
                defaultValue={selected.reviewStatus}
                className="field mt-2"
              >
                <option value="submitted">Submitted</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
                <option value="resubmit">Resubmit</option>
              </select>
            </label>
            <label className="mt-5 block text-sm font-bold">
              Feedback
              <textarea name="feedback" className="field mt-2 min-h-24" />
            </label>
            <button disabled={busy} className="btn-primary mt-6 w-full gap-2">
              <Check className="size-4" />
              {busy ? "Saving..." : "Save Review"}
            </button>
          </form>
        </div>
      )}
      <ConfirmDialog
        open={!!deleting}
        title="Delete Submitted Assignment?"
        description={`Delete ${deleting?.title || "this submitted assignment"}? The student submission record will be removed.`}
        confirmLabel="Delete Assignment"
        onCancel={() => setDeleting(null)}
        onConfirm={removeSubmission}
      />
    </>
  );
}
