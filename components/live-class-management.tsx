"use client";
import { useState } from "react";
import {
  Edit3,
  ExternalLink,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Upload,
  UserCog,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
type Row = {
  id: string;
  title: string;
  description: string;
  meeting_url: string;
  thumbnail_url: string;
  scheduled_start: string;
  scheduled_end: string;
  instructor_ids: string[];
  instructor_names: string[];
  course_ids: string[];
  student_ids: string[];
  staff_ids: string[];
  staff_names: string[];
};
type Option = { id: string; name: string; detail?: string };
export function LiveClassManagement({
  initialRows,
  instructors,
  staff,
  courses,
  students,
}: {
  initialRows: Row[];
  instructors: { id: string; name: string }[];
  staff: Option[];
  courses: { id: string; name: string; instructorId: string | null }[];
  students: {
    id: string;
    name: string;
    email: string;
    courseId: string;
  }[];
}) {
  const [rows, setRows] = useState(initialRows),
    [editing, setEditing] = useState<Row | null | undefined>(undefined),
    [menu, setMenu] = useState<string | null>(null),
    [deleting, setDeleting] = useState<Row | null>(null),
    now = Date.now(),
    scheduledRows = rows.filter(
      (row) => new Date(row.scheduled_end).getTime() >= now,
    ),
    expiredRows = rows.filter(
      (row) => new Date(row.scheduled_end).getTime() < now,
    );
  async function remove(r: Row) {
    const res = await fetch(`/api/admin/live-classes/${r.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setRows((x) => x.filter((y) => y.id !== r.id));
      setDeleting(null);
      toast.success("Live class deleted");
    } else toast.error("Delete failed");
  }
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Academic / Live Classes</p>
          <h1 className="mt-1 text-2xl font-bold text-navy">Live Classes</h1>
        </div>
        <button onClick={() => setEditing(null)} className="btn-primary gap-2">
          <Plus className="size-4" />
          Create Live Class
        </button>
      </div>
      {[
        ["Scheduled Classes", scheduledRows],
        ["Expired Classes", expiredRows],
      ].map(([title, groupRows]) => (
        <section key={title as string} className="mt-8">
          <h2 className="text-xl font-bold text-navy">{title as string}</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(groupRows as Row[]).map((r) => (
              <article
                key={r.id}
                className="relative overflow-visible rounded-2xl border bg-white shadow-sm"
              >
                <img
                  src={r.thumbnail_url}
                  alt=""
                  className="h-52 w-full rounded-t-2xl object-cover"
                />
                <div className="p-5">
                  <div className="flex gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold text-navy">{r.title}</h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                        {r.description}
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setMenu(menu === r.id ? null : r.id)}
                        className="grid size-9 place-items-center rounded-lg border"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                      {menu === r.id && (
                        <div className="absolute right-0 top-11 z-50 w-40 rounded-lg border bg-white py-1 shadow-xl">
                          <a
                            href={r.meeting_url}
                            target="_blank"
                            className="action-row"
                          >
                            <ExternalLink />
                            View
                          </a>
                          <button
                            onClick={() => {
                              setEditing(r);
                              setMenu(null);
                            }}
                            className="action-row"
                          >
                            <Edit3 />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setDeleting(r);
                              setMenu(null);
                            }}
                            className="action-row text-red"
                          >
                            <Trash2 />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <a
                    href={r.meeting_url}
                    target="_blank"
                    className="mt-4 block truncate text-sm font-semibold text-blue-600"
                  >
                    {r.meeting_url}
                  </a>
                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    {new Date(r.scheduled_start).toLocaleString("en-GB")} –{" "}
                    {new Date(r.scheduled_end).toLocaleString("en-GB")}
                  </p>
                  <div className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                    <UserRound className="mt-0.5 size-4 shrink-0 text-red" />
                    <div>
                      <span className="font-semibold text-navy">
                        Instructors:{" "}
                      </span>
                      {r.instructor_names.length
                        ? r.instructor_names.join(", ")
                        : "Not assigned"}
                    </div>
                  </div>
                  {r.staff_names.length > 0 && (
                    <div className="mt-2 flex items-start gap-2 text-sm text-slate-600">
                      <UserCog className="mt-0.5 size-4 shrink-0 text-red" />
                      <div>
                        <span className="font-semibold text-navy">Staff: </span>
                        {r.staff_names.join(", ")}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
            {!(groupRows as Row[]).length && (
              <div className="rounded-xl border border-dashed bg-white p-10 text-center text-slate-400 md:col-span-2 xl:col-span-3">
                No {String(title).toLowerCase()}.
              </div>
            )}
          </div>
        </section>
      ))}
      <ConfirmDialog
        open={!!deleting}
        title="Delete Live Class?"
        description={`Are you sure you want to delete ${deleting?.title || "this live class"}? This action cannot be undone.`}
        confirmLabel="Delete Live Class"
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && remove(deleting)}
      />
      {editing !== undefined && (
        <Editor
          instructors={instructors}
          staff={staff}
          courses={courses}
          students={students}
          value={editing}
          close={() => setEditing(undefined)}
          saved={(r) => {
            setRows((x) =>
              editing ? x.map((y) => (y.id === r.id ? r : y)) : [r, ...x],
            );
            setEditing(undefined);
          }}
        />
      )}
      <style jsx global>{`
        .action-row {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          font-size: 0.875rem;
        }
        .action-row:hover {
          background: #f8fafc;
        }
        .action-row svg {
          width: 1rem;
          height: 1rem;
        }
      `}</style>
    </>
  );
}
function Editor({
  instructors,
  staff,
  courses,
  students,
  value,
  close,
  saved,
}: {
  instructors: { id: string; name: string }[];
  staff: Option[];
  courses: { id: string; name: string; instructorId: string | null }[];
  students: {
    id: string;
    name: string;
    email: string;
    courseId: string;
  }[];
  value: Row | null;
  close: () => void;
  saved: (r: Row) => void;
}) {
  const [busy, setBusy] = useState(false),
    [file, setFile] = useState(""),
    [selectedCourses, setSelectedCourses] = useState<string[]>(
      value?.course_ids || [],
    ),
    [selectedInstructors, setSelectedInstructors] = useState<string[]>(
      value?.instructor_ids || [],
    ),
    [selectedStudents, setSelectedStudents] = useState<string[]>(
      value?.student_ids || [],
    ),
    [selectedStaff, setSelectedStaff] = useState<string[]>(
      value?.staff_ids || [],
    );
  const eligibleInstructorIds = new Set(
      courses
        .filter((course) => selectedCourses.includes(course.id))
        .map((course) => course.instructorId)
        .filter(Boolean),
    ),
    availableInstructors = instructors.filter((instructor) =>
      eligibleInstructorIds.has(instructor.id),
    ),
    availableStudents: Option[] = Array.from(
      new Map(
        students
          .filter((student) => selectedCourses.includes(student.courseId))
          .map((student) => [
            student.id,
            { id: student.id, name: student.name, detail: student.email },
          ]),
      ).values(),
    );
  function changeCourses(next: string[]) {
    const nextInstructorIds = new Set(
        courses
          .filter((course) => next.includes(course.id))
          .map((course) => course.instructorId)
          .filter(Boolean),
      ),
      nextStudentIds = new Set(
        students
          .filter((student) => next.includes(student.courseId))
          .map((student) => student.id),
      );
    setSelectedCourses(next);
    setSelectedInstructors((current) =>
      current.filter((id) => nextInstructorIds.has(id)),
    );
    setSelectedStudents((current) =>
      current.filter((id) => nextStudentIds.has(id)),
    );
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedCourses.length) {
      toast.error("Select at least one course");
      return;
    }
    if (!selectedInstructors.length) {
      toast.error("Select at least one instructor");
      return;
    }
    setBusy(true);
    const form = e.currentTarget,
      data = new FormData(form);
    selectedCourses.forEach((id) => data.append("course_ids", id));
    selectedInstructors.forEach((id) => data.append("instructor_ids", id));
    selectedStudents.forEach((id) => data.append("student_ids", id));
    selectedStaff.forEach((id) => data.append("staff_ids", id));
    const res = value
      ? await fetch(`/api/admin/live-classes/${value.id}`, {
          method: "PATCH",
          body: data,
        })
      : await fetch("/api/admin/live-classes", {
          method: "POST",
          body: data,
        });
    if (res.ok) {
      const row = await res.json();
      saved({
        ...row,
        course_ids: selectedCourses,
        student_ids: selectedStudents,
        staff_ids: selectedStaff,
        staff_names: staff
          .filter((item) => selectedStaff.includes(item.id))
          .map((item) => item.name),
        instructor_ids: selectedInstructors,
        instructor_names: instructors
          .filter((x) => selectedInstructors.includes(x.id))
          .map((x) => x.name),
      });
      toast.success(value ? "Live class updated" : "Live class created");
    } else {
      toast.error((await res.json().catch(() => ({}))).error || "Save failed");
      setBusy(false);
    }
  }
  return (
    <div className="fixed inset-0 z-[130] grid place-items-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:p-4">
      <form
        onSubmit={submit}
        className="my-auto max-h-[94dvh] w-full max-w-sm overflow-y-auto rounded-xl bg-white p-4 sm:max-w-xl sm:rounded-2xl sm:p-6"
      >
        <div className="flex justify-between">
          <h2 className="text-xl font-bold text-navy">
            {value ? "Edit" : "Create"} Live Class
          </h2>
          <button type="button" onClick={close}>
            <X />
          </button>
        </div>
        <label className="mt-6 block text-sm font-semibold">
          Title
          <input
            name="title"
            defaultValue={value?.title}
            className="field mt-2"
            required
          />
        </label>
        <div className="mt-5 overflow-hidden rounded-xl border bg-slate-50">
          {value?.thumbnail_url && !file && (
            <img
              src={value.thumbnail_url}
              alt={`${value.title} thumbnail`}
              className="h-44 w-full object-cover"
            />
          )}
          <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-transparent p-4">
            <Upload className="mb-2 text-red" />
            <b>{value ? "Replace Thumbnail" : "Upload Thumbnail"}</b>
            <input
              name="thumbnail"
              type="file"
              accept="image/*"
              required={!value}
              className="mt-3 text-xs"
              onChange={(e) => setFile(e.target.files?.[0]?.name || "")}
            />
            {file && <small className="mt-2 text-emerald-600">{file}</small>}
          </label>
        </div>
        <MultiSelect
          label="Courses"
          placeholder="Select courses"
          searchPlaceholder="Search courses..."
          options={courses}
          selected={selectedCourses}
          onChange={changeCourses}
        />
        <MultiSelect
          label="Instructors"
          placeholder={
            selectedCourses.length
              ? "Select assigned instructors"
              : "Select courses first"
          }
          searchPlaceholder="Search instructors..."
          options={availableInstructors}
          selected={selectedInstructors}
          onChange={setSelectedInstructors}
          disabled={!selectedCourses.length}
          emptyText="No instructors are assigned to the selected courses"
        />
        <MultiSelect
          label="Staff"
          placeholder="Select staff"
          searchPlaceholder="Search staff name or mail..."
          options={staff}
          selected={selectedStaff}
          onChange={setSelectedStaff}
          emptyText="No active staff found"
        />
        <MultiSelect
          label="Students"
          placeholder={
            selectedCourses.length
              ? "Select enrolled students"
              : "Select courses first"
          }
          searchPlaceholder="Search students..."
          options={availableStudents}
          selected={selectedStudents}
          onChange={setSelectedStudents}
          disabled={!selectedCourses.length}
          emptyText="No enrolled students found for the selected courses"
          selectAll
        />
        <label className="mt-5 block text-sm font-semibold">
          Description
          <textarea
            name="description"
            defaultValue={value?.description}
            className="field mt-2 min-h-32"
            required
          />
        </label>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Scheduled Start
            <input
              name="scheduled_start"
              type="datetime-local"
              defaultValue={toDateTimeLocal(value?.scheduled_start)}
              className="field mt-2"
              required
            />
          </label>
          <label className="block text-sm font-semibold">
            Scheduled End
            <input
              name="scheduled_end"
              type="datetime-local"
              defaultValue={toDateTimeLocal(value?.scheduled_end)}
              className="field mt-2"
              required
            />
          </label>
        </div>
        <label className="mt-5 block text-sm font-semibold">
          Live Class Link
          <input
            name="meeting_url"
            type="url"
            defaultValue={value?.meeting_url}
            className="field mt-2"
            placeholder="https://..."
            required
          />
        </label>
        <div className="mt-6 flex flex-col-reverse gap-2 min-[380px]:flex-row min-[380px]:justify-end">
          <button type="button" onClick={close} className="btn-secondary">
            Cancel
          </button>
          <button disabled={busy} className="btn-primary">
            {busy ? "Saving…" : "Save Live Class"}
          </button>
        </div>
      </form>
    </div>
  );
}

function toDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value),
    offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function MultiSelect({
  label,
  placeholder,
  searchPlaceholder,
  options,
  selected,
  onChange,
  disabled = false,
  emptyText = "No results found",
  selectAll = false,
}: {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  options: Option[];
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  emptyText?: string;
  selectAll?: boolean;
}) {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState("");
  const selectedOptions = options.filter((item) => selected.includes(item.id)),
    filtered = options.filter(
      (item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        !!item.detail?.toLowerCase().includes(query.toLowerCase()),
    ),
    allSelected =
      options.length > 0 && options.every((item) => selected.includes(item.id));
  function toggle(id: string) {
    onChange(
      selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id],
    );
  }
  return (
    <div className="relative mt-5">
      <label className="mb-2 block text-sm font-semibold">{label}</label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="field flex min-h-11 items-center justify-between text-left disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        <span className={selected.length ? "text-slate-800" : "text-slate-400"}>
          {selected.length
            ? `${selected.length} ${label.toLowerCase()} selected`
            : placeholder}
        </span>
        <span className="text-xs text-slate-400">▼</span>
      </button>
      {selectedOptions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedOptions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className="flex items-center gap-1 rounded-full bg-red/10 px-3 py-1 text-xs font-semibold text-red"
            >
              {item.name}
              <X className="size-3" />
            </button>
          ))}
        </div>
      )}
      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white p-2 shadow-xl">
          <div className="flex items-center gap-2 rounded-lg border px-3">
            <Search className="size-4 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 w-full outline-none"
            />
          </div>
          {selectAll && options.length > 0 && (
            <button
              type="button"
              onClick={() =>
                onChange(allSelected ? [] : options.map((item) => item.id))
              }
              className="mt-2 w-full rounded-lg bg-slate-100 px-3 py-2 text-left text-sm font-semibold text-navy hover:bg-slate-200"
            >
              {allSelected ? "Clear All Students" : "Select All Students"}
            </button>
          )}
          <div className="mt-2 max-h-48 overflow-y-auto">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm hover:bg-slate-50"
              >
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded border ${
                    selected.includes(item.id)
                      ? "border-red bg-red text-white"
                      : "border-slate-300"
                  }`}
                >
                  {selected.includes(item.id) ? "✓" : ""}
                </span>
                <span>
                  <span className="block">{item.name}</span>
                  {item.detail && (
                    <span className="block text-xs text-slate-400">
                      {item.detail}
                    </span>
                  )}
                </span>
              </button>
            ))}
            {!filtered.length && (
              <p className="p-3 text-center text-sm text-slate-400">
                {emptyText}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
