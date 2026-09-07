"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BarChart3,
  BookOpen,
  Check,
  ClipboardCheck,
  Download,
  Edit3,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  MoreVertical,
  Plus,
  Save,
  School,
  Search,
  Timer,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
import { TablePagination } from "./table-pagination";

const sections = {
  dashboard: {
    title: "Academic",
    description: "Overview of classes and attendance.",
    icon: LayoutDashboard,
  },
  attendance: {
    title: "Attendance",
    description:
      "Load learners by generated class and batch, then save attendance.",
    icon: ClipboardCheck,
  },
  students: {
    title: "Students",
    description: "View students connected to classes.",
    icon: Users,
  },
  instructors: {
    title: "Instructors",
    description: "View instructors assigned to classes.",
    icon: GraduationCap,
  },
  classes: {
    title: "Class",
    description: "Create and manage class information.",
    icon: School,
  },
  reports: {
    title: "CLASS Reports",
    description: "Review class and attendance reporting.",
    icon: BarChart3,
  },
} as const;
export type ClassSection = keyof typeof sections;

type Option = { id: string; label: string; sub?: string };
type Data = {
  courses: { id: string; title: string }[];
  batches: {
    id: string;
    batch_name: string;
    course_id: string;
    status: string;
  }[];
  liveSessions: {
    id: string;
    title: string;
    meeting_url: string;
    scheduled_start: string;
    scheduled_end: string;
    status: string;
    course_id: string | null;
    live_session_courses: { course_id: string }[];
  }[];
  instructors: { id: string; full_name: string; email: string }[];
  staff: { id: string; full_name: string; email: string }[];
  courseInstructors: { course_id: string; instructor_id: string }[];
  classes: {
    id: string;
    subject: string;
    scheduled_at: string | null;
    live_session_id: string | null;
    created_at: string;
    courseIds: string[];
    batchIds: string[];
    instructorIds: string[];
    staffIds: string[];
  }[];
};
type AttendanceRow = {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  status: "present" | "absent" | "late";
  loginAt: string;
  logoutAt: string;
};

function SearchSelect({
  label,
  options,
  selected,
  onChange,
  multiple = true,
  required = false,
}: {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (ids: string[]) => void;
  multiple?: boolean;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [position, setPosition] = useState({ left: 0, top: 0, width: 280 });
  const root = useRef<HTMLDivElement>(null),
    panel = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        !root.current?.contains(event.target as Node) &&
        !panel.current?.contains(event.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const shown = options.filter((option) =>
    `${option.label} ${option.sub || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div ref={root} className={`relative min-w-0 ${open ? "z-[700]" : "z-0"}`}>
      <label className="mb-2 block text-sm font-semibold text-navy">
        {label}
        {required && <span className="text-red"> *</span>}
      </label>
      <button
        ref={trigger}
        type="button"
        onClick={() => {
          if (!open && trigger.current) {
            const rect = trigger.current.getBoundingClientRect();
            const width = Math.max(240, rect.width);
            setPosition({
              left: Math.max(
                12,
                Math.min(rect.left, window.innerWidth - width - 12),
              ),
              top: rect.bottom + 8,
              width,
            });
          }
          setOpen((value) => !value);
        }}
        className="field flex min-h-[48px] items-center gap-2 text-left"
      >
        <Search className="size-4 shrink-0 text-slate-400" />
        <span className="min-w-0 flex-1 truncate text-sm">
          {selected.length
            ? `${selected.length} selected`
            : `Select ${label.toLowerCase()}`}
        </span>
      </button>
      {open &&
        createPortal(
          <div
            ref={panel}
            style={{
              left: position.left,
              top: position.top,
              width: position.width,
            }}
            className="lms-dropdown-menu fixed z-[30000] rounded-xl p-2"
          >
            <div className="flex items-center gap-2 rounded-lg border px-3">
              <Search className="size-4 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}`}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none"
              />
            </div>
            <div className="mt-2 max-h-52 overflow-y-auto">
              {shown.map((option) => {
                const active = selected.includes(option.id);
                return (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => {
                      onChange(
                        multiple
                          ? active
                            ? selected.filter((id) => id !== option.id)
                            : [...selected, option.id]
                          : [option.id],
                      );
                      if (!multiple) setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50"
                  >
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded border ${active ? "border-red bg-red text-white" : ""}`}
                    >
                      {active && <Check className="size-3" />}
                    </span>
                    <span className="min-w-0">
                      <b className="block truncate text-sm">{option.label}</b>
                      {option.sub && (
                        <small className="block truncate text-slate-400">
                          {option.sub}
                        </small>
                      )}
                    </span>
                  </button>
                );
              })}
              {!shown.length && (
                <p className="p-4 text-center text-sm text-slate-400">
                  No results
                </p>
              )}
            </div>
          </div>,
          document.body,
        )}
      {!!selected.length && multiple && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selected.map((id) => {
            const option = options.find((x) => x.id === id);
            return option ? (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-red/10 px-2.5 py-1 text-xs font-semibold text-red"
              >
                {option.label}
                <button
                  type="button"
                  onClick={() => onChange(selected.filter((x) => x !== id))}
                >
                  <X className="size-3" />
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

export function ClassSectionPage({ section }: { section: ClassSection }) {
  const value = sections[section],
    Icon = value.icon;
  const [data, setData] = useState<Data | null>(null),
    [loading, setLoading] = useState(
      section === "classes" || section === "attendance",
    );
  const load = async () => {
    setLoading(true);
    const response = await fetch("/api/admin/classes", { cache: "no-store" });
    const body = await response.json();
    if (response.ok) setData(body);
    else toast.error(body.error || "Class data could not be loaded");
    setLoading(false);
  };
  useEffect(() => {
    if (section === "classes" || section === "attendance") void load();
  }, [section]);
  return (
    <>
      <div>
        <p className="text-sm text-slate-400">CLASS</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">{value.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{value.description}</p>
      </div>
      {loading ? (
        <section className="mt-7 grid min-h-52 place-items-center rounded-2xl border bg-white">
          <Loader2 className="size-7 animate-spin text-red" />
        </section>
      ) : section === "classes" && data ? (
        <ClassCreator data={data} reload={load} />
      ) : section === "attendance" && data ? (
        <Attendance data={data} />
      ) : section === "reports" ? (
        <AttendanceReport />
      ) : (
        <section className="mt-7 rounded-2xl border bg-white p-8">
          <span className="grid size-14 place-items-center rounded-2xl bg-red/10 text-red">
            <Icon className="size-7" />
          </span>
          <h2 className="mt-5 text-xl font-bold text-navy">{value.title}</h2>
          <p className="mt-2 text-sm text-slate-500">
            This CLASS workspace is ready for its records and controls.
          </p>
        </section>
      )}
    </>
  );
}

function ClassCreator({
  data,
  reload,
}: {
  data: Data;
  reload: () => Promise<void>;
}) {
  const [courseIds, setCourseIds] = useState<string[]>([]),
    [batchIds, setBatchIds] = useState<string[]>([]),
    [instructorIds, setInstructorIds] = useState<string[]>([]),
    [staffIds, setStaffIds] = useState<string[]>([]),
    [subject, setSubject] = useState(""),
    [liveSessionId, setLiveSessionId] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [editing, setEditing] = useState<Data["classes"][number] | null>(null),
    [menu, setMenu] = useState<string | null>(null),
    [deleting, setDeleting] = useState<Data["classes"][number] | null>(null),
    [page, setPage] = useState(1);
  const pageSize = 12,
    totalPages = Math.max(1, Math.ceil(data.classes.length / pageSize)),
    visibleClasses = data.classes.slice((page - 1) * pageSize, page * pageSize);
  const batches = data.batches.filter((item) =>
    courseIds.includes(item.course_id),
  );
  const allowedInstructorIds = new Set(
    data.courseInstructors
      .filter((item) => courseIds.includes(item.course_id))
      .map((item) => item.instructor_id),
  );
  const instructors = data.instructors.filter((item) =>
    allowedInstructorIds.has(item.id),
  );
  const liveSessions = data.liveSessions.filter((session) => {
    const linkedCourseIds = [
      session.course_id,
      ...(session.live_session_courses || []).map((item) => item.course_id),
    ].filter(Boolean);
    return linkedCourseIds.some((id) => courseIds.includes(id as string));
  });
  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      const target = event.target;
      if (
        !(target instanceof Element) ||
        !target.closest("[data-generated-class-menu]")
      )
        setMenu(null);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  useEffect(() => {
    setBatchIds((ids) =>
      ids.filter((id) => batches.some((item) => item.id === id)),
    );
    setInstructorIds((ids) =>
      ids.filter((id) => instructors.some((item) => item.id === id)),
    );
    setLiveSessionId((ids) =>
      ids.filter((id) => liveSessions.some((item) => item.id === id)),
    );
  }, [courseIds]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const response = await fetch(
      editing ? `/api/admin/classes/${editing.id}` : "/api/admin/classes",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          subject,
          courseIds,
          batchIds,
          instructorIds,
          staffIds,
          liveSessionId: liveSessionId[0],
        }),
      },
    );
    const body = await response.json();
    setBusy(false);
    if (!response.ok)
      return toast.error(body.error || "Class could not be created");
    toast.success(
      editing ? "Class updated successfully" : "Class created successfully",
    );
    setCourseIds([]);
    setBatchIds([]);
    setInstructorIds([]);
    setStaffIds([]);
    setSubject("");
    setLiveSessionId([]);
    setEditing(null);
    await reload();
  }
  function edit(item: Data["classes"][number]) {
    setEditing(item);
    setCourseIds(item.courseIds);
    setBatchIds(item.batchIds);
    setInstructorIds(item.instructorIds);
    setStaffIds(item.staffIds);
    setSubject(item.subject);
    setLiveSessionId(item.live_session_id ? [item.live_session_id] : []);
    setMenu(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    const response = await fetch(`/api/admin/classes/${deleting.id}`, {
      method: "DELETE",
    });
    const body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok)
      return toast.error(body.error || "Class could not be deleted");
    toast.success("Class deleted successfully");
    setDeleting(null);
    await reload();
  }
  return (
    <>
      <form
        onSubmit={submit}
        className="mt-7 rounded-2xl border bg-white p-4 sm:p-6"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-red/10 text-red">
            <Plus className="size-5" />
          </span>
          <div>
            <h2 className="font-bold text-navy">
              {editing ? "Edit Class" : "Create Class"}
            </h2>
            <p className="text-xs text-slate-400">
              Connect courses, batches and teaching staff.
            </p>
          </div>
        </div>
        <div className="mt-6 grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
          <SearchSelect
            label="Courses"
            options={data.courses.map((x) => ({ id: x.id, label: x.title }))}
            selected={courseIds}
            onChange={setCourseIds}
            required
          />
          <SearchSelect
            label="Batches"
            options={batches.map((x) => ({ id: x.id, label: x.batch_name }))}
            selected={batchIds}
            onChange={setBatchIds}
            required
          />
          <label className="text-sm font-semibold text-navy">
            Subject <span className="text-red">*</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="field mt-2"
              placeholder="Enter class subject"
              required
            />
          </label>
          <SearchSelect
            label="Link"
            options={liveSessions.map((session) => ({
              id: session.id,
              label: session.title,
              sub: `${new Date(session.scheduled_start).toLocaleString("en-GB")} · ${session.meeting_url}`,
            }))}
            selected={liveSessionId}
            onChange={setLiveSessionId}
            multiple={false}
            required
          />
          <SearchSelect
            label="Instructors"
            options={instructors.map((x) => ({
              id: x.id,
              label: x.full_name,
              sub: x.email,
            }))}
            selected={instructorIds}
            onChange={setInstructorIds}
            required
          />
          <SearchSelect
            label="Staff"
            options={data.staff.map((x) => ({
              id: x.id,
              label: x.full_name,
              sub: x.email,
            }))}
            selected={staffIds}
            onChange={setStaffIds}
          />
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button disabled={busy} className="btn-primary gap-2">
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}{" "}
            {editing ? "Update Class" : "Create Class"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setCourseIds([]);
                setBatchIds([]);
                setInstructorIds([]);
                setStaffIds([]);
                setSubject("");
                setLiveSessionId([]);
              }}
              className="btn-secondary"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
      <section className="mt-6">
        <h2 className="text-lg font-bold text-navy">Generated Classes</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleClasses.map((item) => (
            <article
              key={item.id}
              className={`relative overflow-visible rounded-2xl border bg-white p-5 shadow-sm ${menu === item.id ? "z-[100]" : "z-0"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-red/10 text-red">
                  <School className="size-5" />
                </span>
                <div className="relative" data-generated-class-menu>
                  <button
                    type="button"
                    onClick={() => setMenu(menu === item.id ? null : item.id)}
                    className="grid size-9 place-items-center rounded-lg border"
                  >
                    <MoreVertical className="size-4" />
                  </button>
                  {menu === item.id && (
                    <div
                      data-generated-class-menu
                      className="absolute right-0 top-11 z-50 hidden w-40 rounded-lg border bg-white py-1 text-sm shadow-xl sm:block"
                    >
                      <button
                        type="button"
                        onClick={() => edit(item)}
                        className="action-row"
                      >
                        <Edit3 className="size-4" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleting(item);
                          setMenu(null);
                        }}
                        className="action-row text-red"
                      >
                        <Trash2 className="size-4" /> Delete
                      </button>
                    </div>
                  )}
                  {menu === item.id &&
                    createPortal(
                      <div
                        data-generated-class-menu
                        onClick={() => setMenu(null)}
                        className="fixed inset-0 z-[30000] flex items-end bg-black/45 p-3 backdrop-blur-sm sm:hidden"
                      >
                        <div
                          onClick={(event) => event.stopPropagation()}
                          className="lms-popup-card w-full rounded-2xl p-3 shadow-2xl"
                        >
                          <div className="mb-2 flex items-center justify-between px-2 py-2">
                            <b className="truncate text-navy">{item.subject}</b>
                            <button
                              type="button"
                              onClick={() => setMenu(null)}
                              className="grid size-9 place-items-center rounded-lg border"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => edit(item)}
                            className="action-row min-h-12 rounded-xl"
                          >
                            <Edit3 className="size-5" /> Edit Class
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleting(item);
                              setMenu(null);
                            }}
                            className="action-row min-h-12 rounded-xl text-red"
                          >
                            <Trash2 className="size-5" /> Delete Class
                          </button>
                        </div>
                      </div>,
                      document.body,
                    )}
                </div>
              </div>
              <h3 className="mt-4 text-lg font-bold text-navy">
                {item.subject}
              </h3>
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <BookOpen className="size-4" />{" "}
                {item.courseIds
                  .map((id) => data.courses.find((x) => x.id === id)?.title)
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                <Users className="size-4" />{" "}
                {item.batchIds
                  .map(
                    (id) => data.batches.find((x) => x.id === id)?.batch_name,
                  )
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {new Date(item.scheduled_at || item.created_at).toLocaleString(
                  "en-GB",
                )}
              </p>
              {item.live_session_id && (
                <a
                  href={
                    data.liveSessions.find(
                      (session) => session.id === item.live_session_id,
                    )?.meeting_url
                  }
                  className="btn-secondary mt-4 w-full gap-2"
                >
                  Open Live Class
                </a>
              )}
            </article>
          ))}
          {!data.classes.length && (
            <p className="rounded-2xl border border-dashed bg-white p-10 text-center text-sm text-slate-400 md:col-span-2 xl:col-span-3">
              No classes generated yet.
            </p>
          )}
        </div>
        {data.classes.length > pageSize && (
          <div className="mt-5 overflow-hidden rounded-xl border bg-white">
            <TablePagination
              page={page}
              total={totalPages}
              onChange={(next) => {
                setPage(next);
                setMenu(null);
              }}
            />
          </div>
        )}
      </section>
      <ConfirmDialog
        open={!!deleting}
        title="Delete generated class?"
        description="This removes the class and its saved attendance register."
        busy={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </>
  );
}

function localInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}
function sriLankaDate(value?: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}
function Attendance({ data }: { data: Data }) {
  const [classId, setClassId] = useState<string[]>([]),
    [batchId, setBatchId] = useState<string[]>([]),
    [date, setDate] = useState(""),
    [rows, setRows] = useState<AttendanceRow[]>([]),
    [busy, setBusy] = useState(false),
    [loaded, setLoaded] = useState(false),
    [locked, setLocked] = useState(false);
  const selectedClass = data.classes.find((item) => item.id === classId[0]);
  const batches = data.batches.filter((item) =>
    selectedClass?.batchIds.includes(item.id),
  );
  async function loadStudents() {
    if (!classId[0] || !batchId[0] || !date)
      return toast.error("Select a class, batch and date");
    setBusy(true);
    const response = await fetch(
      `/api/admin/attendance?classId=${classId[0]}&batchId=${batchId[0]}&date=${date}`,
      { cache: "no-store" },
    );
    const body = await response.json();
    setBusy(false);
    if (!response.ok)
      return toast.error(body.error || "Students could not be loaded");
    setRows(
      (body.students || []).map((student: any) => ({
        ...student,
        status: student.attendance?.status || "present",
        loginAt: localInput(student.attendance?.login_at),
        logoutAt: localInput(student.attendance?.logout_at),
      })),
    );
    setLocked(!!body.locked);
    setLoaded(true);
  }
  const markAll = (status: AttendanceRow["status"]) =>
    setRows((items) => items.map((item) => ({ ...item, status })));
  async function save() {
    if (!loaded) return toast.error("Load students first");
    setBusy(true);
    const response = await fetch("/api/admin/attendance", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        classId: classId[0],
        batchId: batchId[0],
        date,
        rows: rows.map((row) => ({
          studentId: row.id,
          status: row.status,
        })),
      }),
    });
    const body = await response.json();
    setBusy(false);
    response.ok
      ? toast.success("Attendance register saved")
      : toast.error(body.error || "Attendance could not be saved");
  }
  return (
    <section className="relative mt-7 overflow-visible rounded-2xl border bg-white p-4 sm:p-6">
      <div className="grid items-start gap-4 lg:grid-cols-[1fr_1fr_220px_auto_auto]">
        <SearchSelect
          label="Class"
          options={data.classes.map((x) => ({ id: x.id, label: x.subject }))}
          selected={classId}
          onChange={(ids) => {
            setClassId(ids);
            const selected = data.classes.find((item) => item.id === ids[0]);
            setDate(
              sriLankaDate(selected?.scheduled_at || selected?.created_at),
            );
            setBatchId([]);
            setLoaded(false);
            setLocked(false);
            setRows([]);
          }}
          multiple={false}
          required
        />
        <SearchSelect
          label="Batch"
          options={batches.map((x) => ({ id: x.id, label: x.batch_name }))}
          selected={batchId}
          onChange={(ids) => {
            setBatchId(ids);
            setLoaded(false);
            setLocked(false);
            setRows([]);
          }}
          multiple={false}
          required
        />
        <label className="text-sm font-semibold text-navy">
          Date
          <input
            type="date"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setLoaded(false);
              setLocked(false);
              setRows([]);
            }}
            className="field mt-2"
          />
        </label>
        <button
          type="button"
          onClick={loadStudents}
          disabled={busy}
          className="btn-secondary mt-7 gap-2 whitespace-nowrap"
        >
          <Users className="size-4" /> Load Students
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy || !loaded || !rows.length || locked}
          className="btn-primary mt-7 gap-2 whitespace-nowrap"
        >
          <Save className="size-4" /> Save Register
        </button>
      </div>
      {loaded && (
        <>
          {locked && (
            <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
              This attendance register has already been saved and cannot be
              modified.
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-semibold text-navy">
              Mark All:
            </span>
            {(["present", "absent", "late"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => markAll(status)}
                disabled={locked}
                className="rounded-full border px-4 py-2 text-xs font-bold capitalize hover:border-red hover:text-red"
              >
                {status}
              </button>
            ))}
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-4">Student Name</th>
                  <th className="px-4 py-4">Attendance Status</th>
                  <th className="px-4 py-4">Login Time & Date</th>
                  <th className="px-4 py-4">Logout Time & Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {row.avatar_url ? (
                          <img
                            src={row.avatar_url}
                            alt=""
                            className="size-9 rounded-full object-cover"
                          />
                        ) : (
                          <span className="grid size-9 place-items-center rounded-full bg-slate-100 font-bold text-navy">
                            {row.full_name[0]}
                          </span>
                        )}
                        <div>
                          <b className="block text-navy">{row.full_name}</b>
                          <small className="text-slate-400">{row.email}</small>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {(["present", "absent", "late"] as const).map(
                          (status) => (
                            <label
                              key={status}
                              className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold capitalize ${row.status === status ? "border-red bg-red/10 text-red" : ""}`}
                            >
                              <input
                                type="radio"
                                name={`status-${row.id}`}
                                checked={row.status === status}
                                disabled={locked}
                                onChange={() =>
                                  setRows((items) =>
                                    items.map((item) =>
                                      item.id === row.id
                                        ? { ...item, status }
                                        : item,
                                    ),
                                  )
                                }
                                className="accent-red"
                              />
                              {status}
                            </label>
                          ),
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="whitespace-nowrap text-sm text-slate-600">
                        {row.loginAt
                          ? new Date(row.loginAt).toLocaleString("en-GB")
                          : "Not joined"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="whitespace-nowrap text-sm text-slate-600">
                        {row.logoutAt
                          ? new Date(row.logoutAt).toLocaleString("en-GB")
                          : "Not left"}
                      </span>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-slate-400">
                      No enrolled students found for this batch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

type ReportData = {
  counts: { present: number; absent: number; late: number };
  rows: {
    id: string;
    avatar: string | null;
    studentName: string;
    email: string;
    course: string;
    batch: string;
    days: Record<string, "present" | "absent" | "late">;
    ratio: number;
  }[];
  options: {
    courses: { id: string; title: string }[];
    batches: { id: string; batch_name: string; course_id: string }[];
    students: {
      id: string;
      full_name: string;
      email: string;
      avatar_url: string | null;
    }[];
  };
};

function AttendanceReport() {
  const [report, setReport] = useState<ReportData | null>(null),
    [month, setMonth] = useState(new Date().toISOString().slice(0, 7)),
    [courseId, setCourseId] = useState<string[]>([]),
    [batchId, setBatchId] = useState<string[]>([]),
    [studentId, setStudentId] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [generated, setGenerated] = useState(false);

  async function generate(showStatement = true) {
    setBusy(true);
    const query = new URLSearchParams({ month });
    if (courseId[0]) query.set("courseId", courseId[0]);
    if (batchId[0]) query.set("batchId", batchId[0]);
    if (studentId[0]) query.set("studentId", studentId[0]);
    const response = await fetch(`/api/admin/attendance/report?${query}`, {
      cache: "no-store",
    });
    const body = await response.json();
    setBusy(false);
    if (!response.ok)
      return toast.error(body.error || "Attendance report could not be loaded");
    setReport(body);
    setGenerated(showStatement);
  }
  useEffect(() => {
    void generate(false);
  }, []);

  const batches = (report?.options.batches || []).filter(
    (item) => !courseId[0] || item.course_id === courseId[0],
  );
  function download() {
    if (!report?.rows.length) return toast.error("No report data to download");
    const escape = (value: string | number) =>
      `"${String(value).replaceAll('"', '""')}"`;
    const daysInMonth = new Date(
      Number(month.slice(0, 4)),
      Number(month.slice(5, 7)),
      0,
    ).getDate();
    const dayNumbers = Array.from(
      { length: daysInMonth },
      (_, index) => index + 1,
    );
    const csv = [
      [
        "#",
        "Student Name",
        "Email",
        "Course",
        "Batch",
        ...dayNumbers.map((day) => `Date ${day}`),
        "Ratio Percentage",
      ],
      ...report.rows.map((row, index) => [
        index + 1,
        row.studentName,
        row.email,
        row.course,
        row.batch,
        ...dayNumbers.map((day) => row.days[String(day)] || "-"),
        `${row.ratio}%`,
      ]),
    ]
      .map((row) => row.map(escape).join(","))
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance-audit-${month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
  const cards = [
    {
      label: "Total Present",
      value: report?.counts.present || 0,
      icon: UserCheck,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Total Absent",
      value: report?.counts.absent || 0,
      icon: UserX,
      color: "bg-red/10 text-red",
    },
    {
      label: "Total Late",
      value: report?.counts.late || 0,
      icon: Timer,
      color: "bg-amber-50 text-amber-600",
    },
  ];
  const daysInMonth = new Date(
    Number(month.slice(0, 4)),
    Number(month.slice(5, 7)),
    0,
  ).getDate();
  const dayNumbers = Array.from(
    { length: daysInMonth },
    (_, index) => index + 1,
  );
  const dayStyle = {
    present: "border-amber-300 bg-amber-100 text-amber-800",
    absent: "border-red-300 bg-red-100 text-red-700",
    late: "border-violet-300 bg-violet-100 text-violet-700",
  } as const;
  return (
    <>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: CardIcon, color }) => (
          <article
            key={label}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <span
              className={`grid size-11 place-items-center rounded-xl ${color}`}
            >
              <CardIcon className="size-5" />
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-500">
              {label} Count
            </p>
            <b className="mt-1 block text-3xl text-navy">{value}</b>
          </article>
        ))}
      </div>
      <section className="relative mt-6 overflow-visible rounded-2xl border bg-white p-4 sm:p-6">
        <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm font-semibold text-navy">
            Date
            <input
              type="month"
              value={month}
              onChange={(event) => {
                setMonth(event.target.value);
                setGenerated(false);
              }}
              className="field mt-2"
            />
          </label>
          <SearchSelect
            label="Course"
            options={(report?.options.courses || []).map((item) => ({
              id: item.id,
              label: item.title,
            }))}
            selected={courseId}
            onChange={(ids) => {
              setCourseId(ids);
              setBatchId([]);
              setGenerated(false);
            }}
            multiple={false}
          />
          <SearchSelect
            label="Batch"
            options={batches.map((item) => ({
              id: item.id,
              label: item.batch_name,
            }))}
            selected={batchId}
            onChange={(ids) => {
              setBatchId(ids);
              setGenerated(false);
            }}
            multiple={false}
          />
          <SearchSelect
            label="Students"
            options={(report?.options.students || []).map((item) => ({
              id: item.id,
              label: item.full_name,
              sub: item.email,
            }))}
            selected={studentId}
            onChange={(ids) => {
              setStudentId(ids);
              setGenerated(false);
            }}
            multiple={false}
          />
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => generate(true)}
            disabled={busy || !month}
            className="btn-primary gap-2"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <BarChart3 className="size-4" />
            )}{" "}
            Generate Monthly Audit
          </button>
        </div>
      </section>
      {generated && report && (
        <section className="mt-6 overflow-visible rounded-2xl border bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5">
            <div>
              <h2 className="text-lg font-bold text-navy">
                Attendance Audit Statement
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Monthly student attendance ratio
              </p>
            </div>
            <button
              type="button"
              onClick={download}
              className="btn-secondary gap-2"
            >
              <Download className="size-4" /> Download Report
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">#</th>
                  <th className="px-5 py-4">Profile</th>
                  <th className="px-5 py-4">Student Name</th>
                  <th className="px-5 py-4">Course</th>
                  <th className="px-5 py-4">Batch</th>
                  <th className="min-w-[500px] px-5 py-4">Date</th>
                  <th className="px-5 py-4">Ratio Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(report?.rows || []).map((row, index) => (
                  <tr key={row.id}>
                    <td className="px-5 py-4">{index + 1}</td>
                    <td className="px-5 py-4">
                      {row.avatar ? (
                        <img
                          src={row.avatar}
                          alt=""
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="grid size-10 place-items-center rounded-full bg-slate-100 font-bold text-navy">
                          {row.studentName[0]}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <b className="block text-navy">{row.studentName}</b>
                      <small className="text-slate-400">{row.email}</small>
                    </td>
                    <td className="px-5 py-4">{row.course}</td>
                    <td className="px-5 py-4">{row.batch}</td>
                    <td className="px-5 py-4">
                      <div className="grid grid-cols-10 gap-1.5">
                        {dayNumbers.map((day) => {
                          const status = row.days[String(day)];
                          return (
                            <span
                              key={day}
                              title={
                                status
                                  ? `${day}: ${status}`
                                  : `${day}: no record`
                              }
                              className={`grid size-8 place-items-center rounded-lg border text-xs font-bold ${status ? dayStyle[status] : "border-slate-200 bg-slate-50 text-slate-400"}`}
                            >
                              {day}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-700">
                        {row.ratio}%
                      </span>
                    </td>
                  </tr>
                ))}
                {!report?.rows.length && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      No attendance records found for these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
