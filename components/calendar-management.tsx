"use client";

import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Pencil,
  Trash2,
  Eye,
  ExternalLink,
  MoreVertical,
  UserPlus,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type CalendarAppointment = {
  id: string;
  title: string;
  description: string | null;
  scheduled_start: string;
  scheduled_end: string | null;
  source?: "appointment" | "live_class";
  meeting_url?: string | null;
  editable?: boolean;
  assignedUserIds?: string[];
};

const dateKey = (value: string | Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
const dateTimeInput = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Colombo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
        .format(new Date(value))
        .replace(" ", "T")
    : "";

export function CalendarManagement({
  initialAppointments,
  initialSelected,
  assignableUsers = [],
}: {
  initialAppointments: CalendarAppointment[];
  initialSelected?: string;
  assignableUsers?: {
    id: string;
    name: string;
    role: string;
    avatar: string | null;
  }[];
}) {
  const router = useRouter();
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState(
    () => initialSelected || dateKey(new Date()),
  );
  const [appointments, setAppointments] = useState(initialAppointments);
  const [editing, setEditing] = useState<CalendarAppointment | null>(null);
  const [showForm, setShowForm] = useState(Boolean(initialSelected));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [menu, setMenu] = useState<string | null>(null),
    [viewing, setViewing] = useState<CalendarAppointment | null>(null),
    [assigning, setAssigning] = useState<CalendarAppointment | null>(null),
    [selectedUsers, setSelectedUsers] = useState<string[]>([]),
    [roleFilter, setRoleFilter] = useState("all"),
    [userSearch, setUserSearch] = useState("");
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest("[data-calendar-menu]"))
        setMenu(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  const days = useMemo(() => {
    const y = month.getFullYear(),
      m = month.getMonth();
    return [
      ...Array.from({ length: new Date(y, m, 1).getDay() }, () => null),
      ...Array.from(
        { length: new Date(y, m + 1, 0).getDate() },
        (_, i) => i + 1,
      ),
    ];
  }, [month]);
  const scheduledRows = appointments
    .filter((x) => new Date(x.scheduled_start) >= new Date())
    .sort(
      (a, b) => +new Date(a.scheduled_start) - +new Date(b.scheduled_start),
    );

  async function createAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setError("");
    const form = new FormData(formElement);
    const response = await fetch(
      editing
        ? `/api/admin/appointments/${editing.id.replace(/^appointment-/, "")}`
        : "/api/admin/appointments",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      },
    );
    const result = await response.json();
    setBusy(false);
    if (!response.ok)
      return setError(result.error || "Unable to create appointment");
    const saved = {
      ...result,
      id: `appointment-${result.id}`,
      source: "appointment" as const,
      editable: true,
    };
    setAppointments((rows) =>
      editing
        ? rows.map((row) => (row.id === editing.id ? saved : row))
        : [...rows, saved],
    );
    formElement.reset();
    setEditing(null);
    setShowForm(false);
    router.refresh();
  }
  async function remove(id: string) {
    const response = await fetch(
      `/api/admin/appointments/${id.replace(/^appointment-/, "")}`,
      { method: "DELETE" },
    );
    if (response.ok) {
      setAppointments((rows) => rows.filter((x) => x.id !== id));
      router.refresh();
    }
  }
  async function assign() {
    if (!assigning) return;
    setBusy(true);
    const response = await fetch(
        `/api/admin/appointments/${assigning.id.replace(/^appointment-/, "")}/assign`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ user_ids: selectedUsers }),
        },
      ),
      body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) return setError(body.error || "Assignment failed");
    setAppointments((rows) =>
      rows.map((row) =>
        row.id === assigning.id
          ? { ...row, assignedUserIds: selectedUsers }
          : row,
      ),
    );
    setAssigning(null);
    setMenu(null);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Communication</p>
          <h1 className="mt-1 text-2xl font-bold text-navy">Calendar</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create appointments and manage scheduled events.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn-primary gap-2"
        >
          <CalendarPlus className="size-4" />
          Create Appointment
        </button>
      </div>
      <div className="mt-7 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,.75fr)]">
        <section className="min-w-0 rounded-2xl border bg-white p-3 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
              className="grid size-9 place-items-center rounded-lg border"
            >
              <ChevronLeft className="size-4" />
            </button>
            <h2 className="font-bold text-navy">
              {month.toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
              className="grid size-9 place-items-center rounded-lg border"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-1 sm:gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((x) => (
              <div
                key={x}
                className="py-2 text-center text-[10px] font-bold uppercase text-slate-400"
              >
                {x}
              </div>
            ))}
            {days.map((day, index) => {
              if (!day)
                return (
                  <div
                    key={`blank-${index}`}
                    className="min-h-14 rounded-lg bg-slate-50/50 sm:min-h-24"
                  />
                );
              const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const rows = appointments.filter(
                (x) => dateKey(x.scheduled_start) === key,
              );
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`min-h-14 rounded-lg border p-1.5 text-left align-top sm:min-h-24 sm:p-2 ${selected === key ? "border-red ring-2 ring-red/10" : "border-slate-100"}`}
                >
                  <span
                    className={`grid size-6 place-items-center rounded-full text-xs ${dateKey(new Date()) === key ? "bg-red font-bold text-white" : "text-slate-600"}`}
                  >
                    {day}
                  </span>
                  {rows.slice(0, 2).map((x) => (
                    <span
                      key={x.id}
                      className="mt-1 block truncate rounded bg-red/10 px-1.5 py-1 text-[9px] font-semibold text-red"
                    >
                      {x.title}
                    </span>
                  ))}
                  {rows.length > 2 && (
                    <span className="text-[9px] text-slate-400">
                      +{rows.length - 2} more
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
        <div className="contents">
          {showForm && (
            <div className="fixed inset-0 z-[210] grid place-items-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm">
              <section
                id="appointment-form"
                className="my-auto max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-white p-4 shadow-2xl sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-bold text-navy">
                    {editing ? "Edit Appointment" : "Create Appointment"}
                  </h2>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => {
                      setEditing(null);
                      setShowForm(false);
                    }}
                    className="grid size-9 place-items-center rounded-lg border"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  All dates and times use Sri Lanka time.
                </p>
                <form
                  key={editing?.id || selected}
                  onSubmit={createAppointment}
                  className="mt-5 space-y-4"
                >
                  <label className="block text-sm font-semibold text-navy">
                    Title
                    <input
                      name="title"
                      required
                      defaultValue={editing?.title || ""}
                      className="mt-2 w-full rounded-lg border px-3 py-2.5 font-normal"
                      placeholder="Appointment title"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-navy">
                    Start date and time
                    <input
                      name="scheduled_start"
                      type="datetime-local"
                      required
                      defaultValue={
                        editing
                          ? dateTimeInput(editing.scheduled_start)
                          : `${selected}T09:00`
                      }
                      className="mt-2 w-full rounded-lg border px-3 py-2.5 font-normal"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-navy">
                    End date and time{" "}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                    <input
                      name="scheduled_end"
                      type="datetime-local"
                      defaultValue={dateTimeInput(editing?.scheduled_end)}
                      className="mt-2 w-full rounded-lg border px-3 py-2.5 font-normal"
                    />
                  </label>
                  <label className="block text-sm font-semibold text-navy">
                    Description{" "}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editing?.description || ""}
                      className="mt-2 w-full rounded-lg border px-3 py-2.5 font-normal"
                    />
                  </label>
                  {error && <p className="text-sm text-red">{error}</p>}
                  <button disabled={busy} className="btn-primary w-full">
                    {busy
                      ? "Saving…"
                      : editing
                        ? "Update Appointment"
                        : "Create Appointment"}
                  </button>
                </form>
              </section>
            </div>
          )}
          <section className="min-w-0 rounded-2xl border bg-white p-4 sm:p-5">
            <h2 className="font-bold text-navy">All Scheduled Events</h2>
            <div className="mt-4 space-y-3">
              {scheduledRows.map((row) => (
                <article
                  key={row.id}
                  className={`relative flex gap-3 overflow-visible rounded-xl border p-4 ${menu === row.id ? "z-[200]" : "z-0"}`}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-red/10 text-red">
                    <Clock3 className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <b className="text-sm text-navy">{row.title}</b>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${row.source === "live_class" ? "bg-blue-50 text-blue-700" : "bg-red/10 text-red"}`}
                      >
                        {row.source === "live_class"
                          ? "Live class"
                          : "Appointment"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(row.scheduled_start).toLocaleString("en-LK", {
                        timeZone: "Asia/Colombo",
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {row.scheduled_end
                        ? ` – ${new Date(row.scheduled_end).toLocaleTimeString("en-LK", { timeZone: "Asia/Colombo", hour: "2-digit", minute: "2-digit" })}`
                        : ""}
                    </p>
                    {row.description && (
                      <p className="mt-2 text-xs text-slate-400">
                        {row.description}
                      </p>
                    )}
                  </div>
                  <div className="relative shrink-0" data-calendar-menu>
                    <button
                      onClick={() => setMenu(menu === row.id ? null : row.id)}
                      className="grid size-9 place-items-center rounded-lg border"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {menu === row.id && (
                      <div className="absolute right-0 top-11 z-[190] w-44 rounded-xl border bg-white p-1 shadow-2xl">
                        <button
                          onClick={() => {
                            setViewing(row);
                            setMenu(null);
                          }}
                          className="row-action"
                        >
                          <Eye />
                          View
                        </button>
                        {row.source === "live_class" && row.meeting_url && (
                          <a
                            href={row.meeting_url}
                            target="_blank"
                            rel="noreferrer"
                            className="row-action"
                          >
                            <ExternalLink />
                            Join Live Class
                          </a>
                        )}
                        {row.source !== "live_class" &&
                          row.editable !== false && (
                            <>
                              <button
                                onClick={() => {
                                  setEditing(row);
                                  setSelected(dateKey(row.scheduled_start));
                                  setShowForm(true);
                                  setMenu(null);
                                }}
                                className="row-action"
                              >
                                <Pencil />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setAssigning(row);
                                  setSelectedUsers(row.assignedUserIds || []);
                                  setMenu(null);
                                }}
                                className="row-action"
                              >
                                <UserPlus />
                                Assign
                              </button>
                              <button
                                onClick={() => remove(row.id)}
                                className="row-action text-red"
                              >
                                <Trash2 />
                                Delete
                              </button>
                            </>
                          )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
              {!scheduledRows.length && (
                <p className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-400">
                  No scheduled events.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
      {viewing && (
        <div className="fixed inset-0 z-[220] grid place-items-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="flex justify-between">
              <h2 className="text-xl font-bold text-navy">{viewing.title}</h2>
              <button onClick={() => setViewing(null)}>
                <X />
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              {viewing.description || "No description"}
            </p>
            <p className="mt-4 text-sm font-semibold">
              {new Date(viewing.scheduled_start).toLocaleString("en-LK", {
                timeZone: "Asia/Colombo",
              })}
            </p>
          </div>
        </div>
      )}
      {assigning && (
        <div className="fixed inset-0 z-[220] grid place-items-center bg-black/55 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-bold text-navy">Assign Event</h2>
                <p className="text-sm text-slate-500">{assigning.title}</p>
              </div>
              <button onClick={() => setAssigning(null)}>
                <X />
              </button>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="field mt-5"
            >
              <option value="all">All user roles</option>
              <option value="instructor">Instructor</option>
              <option value="student">Student</option>
              <option value="admin_staff">Staff</option>
            </select>
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="field mt-3"
              placeholder="Search students, instructors, or staff..."
            />
            <div className="mt-4 space-y-2">
              {assignableUsers
                .filter((u) =>
                  ["student", "instructor", "admin_staff"].includes(u.role),
                )
                .filter((u) => roleFilter === "all" || u.role === roleFilter)
                .filter((u) =>
                  u.name.toLowerCase().includes(userSearch.toLowerCase()),
                )
                .map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 rounded-xl border p-3"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u.id)}
                      onChange={(e) =>
                        setSelectedUsers((x) =>
                          e.target.checked
                            ? [...x, u.id]
                            : x.filter((id) => id !== u.id),
                        )
                      }
                    />
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        className="size-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="grid size-9 place-items-center rounded-full bg-navy text-white">
                        {u.name[0]}
                      </span>
                    )}
                    <span>
                      <b className="block text-sm">{u.name}</b>
                      <small className="capitalize">
                        {u.role.replaceAll("_", " ")}
                      </small>
                    </span>
                  </label>
                ))}
            </div>
            <button
              disabled={busy}
              onClick={assign}
              className="btn-primary mt-5 w-full"
            >
              Save Assignments
            </button>
          </div>
        </div>
      )}
      <style jsx global>{`
        .row-action {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 0.5rem;
          border-radius: 0.5rem;
          padding: 0.65rem 0.75rem;
          text-align: left;
          font-size: 0.875rem;
        }
        .row-action:hover {
          background: #f8fafc;
        }
        .row-action svg {
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
        }
      `}</style>
    </>
  );
}
