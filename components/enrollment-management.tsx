"use client";
import { useEffect, useMemo, useState } from "react";
import {
  BookPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Search,
  Trash2,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
export type EnrollmentRow = {
  id: string;
  student: string;
  studentEmail: string;
  course: string;
  date: string;
  status: string;
};
type Option = { id: string; name: string };
export function EnrollmentManagement({
  initialRows,
  students,
  courses,
}: {
  initialRows: EnrollmentRow[];
  students: Option[];
  courses: Option[];
}) {
  const [rows, setRows] = useState(initialRows),
    [query, setQuery] = useState(""),
    [adding, setAdding] = useState(false),
    [menu, setMenu] = useState<string | null>(null),
    [statusMenu, setStatusMenu] = useState<string | null>(null),
    [page, setPage] = useState(1),
    [deleting, setDeleting] = useState<EnrollmentRow | null>(null);
  const filtered = useMemo(
      () =>
        rows.filter((x) =>
          `${x.student} ${x.studentEmail} ${x.course} ${x.status}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
      [rows, query],
    ),
    pages = Math.max(1, Math.ceil(filtered.length / 15)),
    visible = filtered.slice((page - 1) * 15, page * 15);
  useEffect(() => setPage(1), [query]);
  async function status(row: EnrollmentRow, value: "approved" | "declined") {
    const old = row.status;
    setRows((x) =>
      x.map((y) => (y.id === row.id ? { ...y, status: value } : y)),
    );
    setMenu(null);
    setStatusMenu(null);
    const res = await fetch(`/api/admin/enrollments/${row.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: value }),
    });
    if (!res.ok) {
      setRows((x) =>
        x.map((y) => (y.id === row.id ? { ...y, status: old } : y)),
      );
      toast.error("Update failed");
    }
  }
  async function remove(row: EnrollmentRow) {
    const res = await fetch(`/api/admin/enrollments/${row.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setRows((x) => x.filter((y) => y.id !== row.id));
      setDeleting(null);
      toast.success("Enrollment deleted");
    } else toast.error("Delete failed");
  }
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Academic / Enrollment</p>
          <h1 className="mt-1 text-2xl font-bold text-navy">Enrollment</h1>
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary gap-2">
          <UserPlus className="size-4" />
          Add Student To Course
        </button>
      </div>
      <section className="mt-7 overflow-visible rounded-xl border bg-white">
        <div className="border-b p-5">
          <label className="relative block max-w-lg">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="field py-2.5 pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student, course or status..."
            />
          </label>
        </div>
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="min-w-[850px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Student</th>
                <th className="p-4">Courses</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((r, i) => (
                <tr key={r.id}>
                  <td className="p-4 text-slate-400">
                    {(page - 1) * 15 + i + 1}
                  </td>
                  <td className="p-4">
                    <b className="block text-navy">{r.student}</b>
                    <small>{r.studentEmail}</small>
                  </td>
                  <td className="p-4">{r.course}</td>
                  <td className="p-4">
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <Badge value={r.status} />
                  </td>
                  <td className="relative p-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setMenu(menu === r.id ? null : r.id);
                          setStatusMenu(null);
                        }}
                        className="grid size-9 place-items-center rounded-lg border"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </div>
                    {menu === r.id && (
                      <div className="absolute right-4 top-14 z-[100] w-44 rounded-lg border bg-white py-1 shadow-xl">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setStatusMenu(statusMenu === r.id ? null : r.id)
                            }
                            className="row-action"
                          >
                            <Check />
                            Status
                            <ChevronRight className="ml-auto" />
                          </button>
                          {statusMenu === r.id && (
                            <div className="absolute right-full top-0 mr-1 w-40 rounded-lg border bg-white py-1 shadow-xl">
                              <button
                                onClick={() => status(r, "approved")}
                                className="row-action"
                              >
                                <Check className="text-emerald-600" />
                                Approved
                              </button>
                              <button
                                onClick={() => status(r, "declined")}
                                className="row-action"
                              >
                                <XCircle className="text-red" />
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setDeleting(r);
                            setMenu(null);
                          }}
                          className="row-action text-red"
                        >
                          <Trash2 />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t p-4">
          <small className="text-slate-400">15 enrollments per page</small>
          <div className="flex gap-1">
            <Page disabled={page === 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft />
              Previous
            </Page>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                onClick={() => setPage(n)}
                className={`grid size-9 place-items-center rounded-lg ${page === n ? "bg-red text-white" : "border"}`}
                key={n}
              >
                {n}
              </button>
            ))}
            <Page disabled={page === pages} onClick={() => setPage(page + 1)}>
              Next
              <ChevronRight />
            </Page>
          </div>
        </div>
      </section>
      <ConfirmDialog
        open={!!deleting}
        title="Delete Enrollment?"
        description={`Remove ${deleting?.student || "this student"} from ${deleting?.course || "this course"}?`}
        confirmLabel="Delete Enrollment"
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && remove(deleting)}
      />
      {adding && (
        <Add
          students={students}
          courses={courses}
          close={() => setAdding(false)}
          saved={(r) => {
            setRows((x) => [r, ...x]);
            setAdding(false);
          }}
        />
      )}
      <style jsx global>{`
        .row-action {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          font-size: 0.875rem;
        }
        .row-action:hover {
          background: #f8fafc;
        }
        .row-action svg {
          width: 1rem;
          height: 1rem;
        }
      `}</style>
    </>
  );
}
function Badge({ value }: { value: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${value === "approved" ? "bg-emerald-50 text-emerald-700" : value === "declined" ? "bg-red/5 text-red" : "bg-amber-50 text-amber-700"}`}
    >
      {value}
    </span>
  );
}
function Page({
  children,
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs disabled:opacity-40"
    >
      {children}
    </button>
  );
}
function Add({
  students,
  courses,
  close,
  saved,
}: {
  students: Option[];
  courses: Option[];
  close: () => void;
  saved: (r: EnrollmentRow) => void;
}) {
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/admin/enrollments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
    });
    if (res.ok) {
      saved(await res.json());
      toast.success("Student added");
    } else {
      toast.error("Could not add student");
      setBusy(false);
    }
  }
  return (
    <div className="fixed inset-0 z-[130] grid place-items-center bg-black/50 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-white p-6"
      >
        <div className="flex justify-between">
          <h2 className="text-xl font-bold text-navy">Add Student To Course</h2>
          <button type="button" onClick={close}>
            <X />
          </button>
        </div>
        <select name="student_id" className="field mt-6" required>
          <option value="">Select student</option>
          {students.map((x) => (
            <option value={x.id} key={x.id}>
              {x.name}
            </option>
          ))}
        </select>
        <select name="course_id" className="field mt-4" required>
          <option value="">Select course</option>
          {courses.map((x) => (
            <option value={x.id} key={x.id}>
              {x.name}
            </option>
          ))}
        </select>
        <button disabled={busy} className="btn-primary mt-5 w-full gap-2">
          <BookPlus className="size-4" />
          {busy ? "Adding…" : "Add Student"}
        </button>
      </form>
    </div>
  );
}
