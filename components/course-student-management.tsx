"use client";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";

type Student = { id: string; name: string; email: string };
type Enrolled = Student & {
  enrollmentId: string;
  date: string;
  status: string;
};
export function CourseStudentManagement({
  courseId,
  courseTitle,
  initialEnrolled,
  allStudents,
}: {
  courseId: string;
  courseTitle: string;
  initialEnrolled: Enrolled[];
  allStudents: Student[];
}) {
  const [enrolled, setEnrolled] = useState(initialEnrolled),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [deleting, setDeleting] = useState<Enrolled | null>(null);
  const available = useMemo(
    () =>
      allStudents.filter(
        (x) =>
          !enrolled.some((e) => e.id === x.id) &&
          `${x.name} ${x.email}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [allStudents, enrolled, query],
  );
  const pages = Math.max(1, Math.ceil(available.length / 10)),
    visible = available.slice((page - 1) * 10, page * 10);
  async function add(s: Student) {
    const res = await fetch("/api/admin/enrollments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ student_id: s.id, course_id: courseId }),
    });
    if (res.ok) {
      const x = await res.json();
      setEnrolled((v) => [
        { ...s, enrollmentId: x.id, date: x.date, status: x.status },
        ...v,
      ]);
      toast.success("Student enrolled");
    } else
      toast.error(
        (await res.json().catch(() => ({}))).error || "Enrollment failed",
      );
  }
  async function remove(s: Enrolled) {
    const res = await fetch(`/api/admin/enrollments/${s.enrollmentId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setEnrolled((v) => v.filter((x) => x.enrollmentId !== s.enrollmentId));
      setDeleting(null);
      toast.success("Student removed");
    } else toast.error("Remove failed");
  }
  return (
    <>
      <div>
        <p className="text-sm text-slate-400">Courses / {courseTitle}</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">Manage Students</h1>
      </div>
      <section className="mt-7 rounded-xl border bg-white p-5">
        <h2 className="text-lg font-bold text-navy">
          Enrolled Students{" "}
          <span className="text-slate-400">({enrolled.length})</span>
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {enrolled.map((s) => (
            <div
              key={s.enrollmentId}
              className="flex items-center gap-3 rounded-xl border p-4"
            >
              <span className="grid size-10 place-items-center rounded-full bg-navy font-bold text-white">
                {s.name[0]}
              </span>
              <div className="min-w-0 flex-1">
                <b className="block truncate text-navy">{s.name}</b>
                <small className="text-slate-400">{s.email}</small>
              </div>
              <button
                onClick={() => setDeleting(s)}
                className="flex items-center gap-2 rounded-lg border border-red/20 px-3 py-2 text-xs font-semibold text-red"
              >
                <Trash2 className="size-4" />
                Remove
              </button>
            </div>
          ))}
          {!enrolled.length && (
            <p className="text-sm text-slate-400">
              No students enrolled in this course.
            </p>
          )}
        </div>
      </section>
      <ConfirmDialog
        open={!!deleting}
        title="Remove Student?"
        description={`Remove ${deleting?.name || "this student"} from ${courseTitle}?`}
        confirmLabel="Remove Student"
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && remove(deleting)}
      />
      <section className="mt-6 overflow-hidden rounded-xl border bg-white">
        <div className="p-5">
          <h2 className="text-lg font-bold text-navy">All Students</h2>
          <label className="relative mt-4 block max-w-lg">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="field pl-10"
              placeholder="Search students..."
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Student</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((s, i) => (
                <tr key={s.id}>
                  <td className="p-4">{(page - 1) * 10 + i + 1}</td>
                  <td className="p-4 font-semibold text-navy">{s.name}</td>
                  <td className="p-4">{s.email}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => add(s)}
                      className="inline-flex items-center gap-2 rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white"
                    >
                      <UserPlus className="size-4" />
                      Enroll
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pages={pages} setPage={setPage} />
      </section>
    </>
  );
}
function Pagination({
  page,
  pages,
  setPage,
}: {
  page: number;
  pages: number;
  setPage: (n: number) => void;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-1 border-t p-4">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="btn-secondary px-3 py-2 text-xs"
      >
        <ChevronLeft className="size-4" />
        Previous
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => setPage(n)}
          className={`grid size-9 place-items-center rounded-lg ${n === page ? "bg-red text-white" : "border"}`}
        >
          {n}
        </button>
      ))}
      <button
        disabled={page === pages}
        onClick={() => setPage(page + 1)}
        className="btn-secondary px-3 py-2 text-xs"
      >
        Next
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
