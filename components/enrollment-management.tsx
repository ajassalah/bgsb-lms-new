"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookPlus,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  MoreVertical,
  Search,
  Trash2,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
import { useStaffCan } from "./staff-permission-context";
export type EnrollmentRow = {
  id: string;
  student: string;
  studentEmail: string;
  studentId: string;
  course: string;
  courseId: string;
  date: string;
  status: string;
  batchId: string;
  batch: string;
};
type Option = { id: string; name: string };
type BatchOption = Option & { courseId: string };
export function EnrollmentManagement({
  initialRows,
  students,
  courses,
  batches,
}: {
  initialRows: EnrollmentRow[];
  students: Option[];
  courses: Option[];
  batches: BatchOption[];
}) {
  const router = useRouter();
  const canCreate = useStaffCan("enrollment", "create");
  const canEdit = useStaffCan("enrollment", "edit");
  const canStatus = useStaffCan("enrollment", "status");
  const canDelete = useStaffCan("enrollment", "delete");
  const [rows, setRows] = useState(initialRows),
    [query, setQuery] = useState(""),
    [adding, setAdding] = useState(false),
    [editing, setEditing] = useState<EnrollmentRow | null>(null),
    [menu, setMenu] = useState<string | null>(null),
    [statusMenu, setStatusMenu] = useState<string | null>(null),
    [page, setPage] = useState(1),
    [deleting, setDeleting] = useState<EnrollmentRow | null>(null);
  useEffect(() => setRows(initialRows), [initialRows]);
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
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      setRows((x) =>
        x.map((y) => (y.id === row.id ? { ...y, status: old } : y)),
      );
      toast.error("Update failed");
    } else {
      toast.success("Enrollment status updated");
      if (result.emailWarning) toast.warning(result.emailWarning);
      router.refresh();
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
        {canCreate && (
          <button onClick={() => setAdding(true)} className="btn-primary gap-2">
            <UserPlus className="size-4" />
            Add Student To Course
          </button>
        )}
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
                    {(canEdit || canStatus || canDelete) && (
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
                    )}
                    {menu === r.id && (
                      <div className="absolute right-4 top-14 z-[100] w-44 rounded-lg border bg-white py-1 shadow-xl">
                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditing(r);
                              setMenu(null);
                            }}
                            className="row-action"
                          >
                            <Edit3 />
                            Edit
                          </button>
                        )}
                        {canStatus && (
                          <div>
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
                              <div className="mx-1 mb-1 rounded-lg border-y bg-slate-50 p-1">
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
                        )}
                        {canDelete && (
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
                        )}
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
          batches={batches}
          close={() => setAdding(false)}
          saved={(r) => {
            setRows((x) => [r, ...x]);
            setAdding(false);
          }}
        />
      )}
      {editing && (
        <EditEnrollment
          row={editing}
          students={students}
          courses={courses}
          batches={batches}
          close={() => setEditing(null)}
          saved={(updated) => {
            setRows((current) =>
              current.map((row) => (row.id === updated.id ? updated : row)),
            );
            setEditing(null);
            router.refresh();
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
  batches,
  close,
  saved,
}: {
  students: Option[];
  courses: Option[];
  batches: BatchOption[];
  close: () => void;
  saved: (r: EnrollmentRow) => void;
}) {
  const [busy, setBusy] = useState(false),
    [studentId, setStudentId] = useState(""),
    [courseId, setCourseId] = useState(""),
    [batchId, setBatchId] = useState("");
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
    <div className="fixed inset-0 z-[130] grid place-items-center overflow-y-auto bg-black/50 p-3 sm:p-4">
      <form
        onSubmit={submit}
        className="my-auto w-full max-w-sm overflow-visible rounded-xl bg-white p-4 sm:max-w-md sm:rounded-2xl sm:p-6"
      >
        <div className="flex justify-between">
          <h2 className="text-xl font-bold text-navy">Add Student To Course</h2>
          <button type="button" onClick={close}>
            <X />
          </button>
        </div>
        <div className="mt-6">
          <SearchSelect
            name="student_id"
            label="Student"
            placeholder="Select student"
            options={students}
            value={studentId}
            onChange={setStudentId}
          />
        </div>
        <div className="mt-4">
          <SearchSelect
            name="course_id"
            label="Course"
            placeholder="Select course"
            options={courses}
            value={courseId}
            onChange={setCourseId}
          />
        </div>
        <div className="mt-4">
          <SearchSelect
            name="batch_id"
            label="Batch"
            placeholder="Select batch"
            options={batches.filter((x) => x.courseId === courseId)}
            value={batchId}
            onChange={setBatchId}
            required={false}
          />
        </div>
        <button disabled={busy} className="btn-primary mt-5 w-full gap-2">
          <BookPlus className="size-4" />
          {busy ? "Adding…" : "Add Student"}
        </button>
      </form>
    </div>
  );
}

function EditEnrollment({
  row,
  students,
  courses,
  batches,
  close,
  saved,
}: {
  row: EnrollmentRow;
  students: Option[];
  courses: Option[];
  batches: BatchOption[];
  close: () => void;
  saved: (row: EnrollmentRow) => void;
}) {
  const [busy, setBusy] = useState(false),
    [studentId, setStudentId] = useState(row.studentId),
    [courseId, setCourseId] = useState(row.courseId),
    [batchId, setBatchId] = useState(row.batchId || "");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch(`/api/admin/enrollments/${row.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(body.error || "Enrollment update failed");
      setBusy(false);
      return;
    }
    const student = students.find((item) => item.id === values.student_id),
      course = courses.find((item) => item.id === values.course_id);
    saved({
      ...row,
      studentId: String(values.student_id),
      courseId: String(values.course_id),
      student: student?.name.replace(/\s*\([^)]*\)\s*$/, "") || row.student,
      studentEmail:
        student?.name.match(/\(([^)]+)\)\s*$/)?.[1] || row.studentEmail,
      course: course?.name || row.course,
      batchId: String(values.batch_id || ""),
      batch: batches.find((item) => item.id === values.batch_id)?.name || "",
      status: String(values.status),
    });
    toast.success("Enrollment updated");
  }
  return (
    <div className="fixed inset-0 z-[140] grid place-items-center bg-black/50 p-3">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Enrollment</p>
            <h2 className="text-xl font-bold text-navy">Edit Enrollment</h2>
          </div>
          <button type="button" onClick={close}>
            <X />
          </button>
        </div>
        <div className="mt-6">
          <SearchSelect
            name="student_id"
            label="Student"
            placeholder="Select student"
            options={students}
            value={studentId}
            onChange={setStudentId}
          />
        </div>
        <div className="mt-4">
          <SearchSelect
            name="course_id"
            label="Course"
            placeholder="Select course"
            options={courses}
            value={courseId}
            onChange={setCourseId}
          />
        </div>
        <div className="mt-4">
          <SearchSelect
            name="batch_id"
            label="Batch"
            placeholder="Select batch"
            options={batches.filter((x) => x.courseId === courseId)}
            value={batchId}
            onChange={setBatchId}
            required={false}
          />
        </div>
        <label className="mt-4 block text-sm font-bold">
          Status
          <select
            name="status"
            defaultValue={row.status}
            className="field mt-2"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <button disabled={busy} className="btn-primary mt-6 w-full gap-2">
          <Edit3 className="size-4" />
          {busy ? "Saving..." : "Update Enrollment"}
        </button>
      </form>
    </div>
  );
}

function SearchSelect({
  name,
  label,
  placeholder,
  options,
  value,
  onChange,
  required = true,
}: {
  name: string;
  label: string;
  placeholder: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false),
    [search, setSearch] = useState(""),
    containerRef = useRef<HTMLLabelElement>(null);
  const selected = options.find((option) => option.id === value),
    filtered = options.filter((option) =>
      option.name.toLowerCase().includes(search.toLowerCase()),
    );
  useEffect(() => {
    function close(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <label
      ref={containerRef}
      className={`relative block text-sm font-bold ${open ? "z-[190]" : "z-0"}`}
    >
      {label}
      <input type="hidden" name={name} value={value} required={required} />
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="field mt-2 flex w-full items-center justify-between text-left font-normal"
      >
        <span className={selected ? "text-navy" : "text-slate-400"}>
          {selected?.name || placeholder}
        </span>
        <ChevronDown className="size-4 text-slate-400" />
      </button>
      {open && (
        <div className="absolute z-[170] mt-2 w-full rounded-xl border bg-white p-2 shadow-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="field py-2 pl-9 font-normal"
              placeholder={`Search ${label.toLowerCase()}...`}
            />
          </div>
          <div className="mt-2 max-h-52 overflow-y-auto">
            {filtered.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                  setSearch("");
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left font-normal hover:bg-slate-50 ${value === option.id ? "bg-red/5 text-red" : "text-navy"}`}
              >
                <span>{option.name}</span>
                {value === option.id && <Check className="size-4" />}
              </button>
            ))}
            {!filtered.length && (
              <p className="px-3 py-4 text-center font-normal text-slate-400">
                No results found
              </p>
            )}
          </div>
        </div>
      )}
    </label>
  );
}
