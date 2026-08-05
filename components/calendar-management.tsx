"use client";

import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Pencil,
  Trash2,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type CalendarAppointment = {
  id: string;
  title: string;
  description: string | null;
  scheduled_start: string;
  scheduled_end: string | null;
  source?: "appointment" | "live_class";
  meeting_url?: string | null;
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
}: {
  initialAppointments: CalendarAppointment[];
  initialSelected?: string;
}) {
  const router = useRouter();
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState(
    () => initialSelected || dateKey(new Date()),
  );
  const [appointments, setAppointments] = useState(initialAppointments);
  const [editing, setEditing] = useState<CalendarAppointment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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
    };
    setAppointments((rows) =>
      editing
        ? rows.map((row) => (row.id === editing.id ? saved : row))
        : [...rows, saved],
    );
    formElement.reset();
    setEditing(null);
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
          onClick={() =>
            document
              .getElementById("appointment-form")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="btn-primary gap-2"
        >
          <CalendarPlus className="size-4" />
          Create Appointment
        </button>
      </div>
      <section className="mt-7 rounded-2xl border bg-white p-4 sm:p-6">
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
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.25fr]">
        <section
          id="appointment-form"
          className="rounded-2xl border bg-white p-5 sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-navy">
              {editing ? "Edit Appointment" : "Create Appointment"}
            </h2>
            {editing && (
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-xs font-semibold text-slate-500"
              >
                Cancel edit
              </button>
            )}
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
              <span className="font-normal text-slate-400">(optional)</span>
              <input
                name="scheduled_end"
                type="datetime-local"
                defaultValue={dateTimeInput(editing?.scheduled_end)}
                className="mt-2 w-full rounded-lg border px-3 py-2.5 font-normal"
              />
            </label>
            <label className="block text-sm font-semibold text-navy">
              Description{" "}
              <span className="font-normal text-slate-400">(optional)</span>
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
        <section className="rounded-2xl border bg-white p-5 sm:p-6">
          <h2 className="font-bold text-navy">All Scheduled Events</h2>
          <div className="mt-4 space-y-3">
            {scheduledRows.map((row) => (
              <article
                key={row.id}
                className="flex gap-3 rounded-xl border p-4"
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
                    {new Date(row.scheduled_start).toLocaleTimeString("en-LK", {
                      timeZone: "Asia/Colombo",
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
                {row.source !== "live_class" && (
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => {
                        setEditing(row);
                        setSelected(dateKey(row.scheduled_start));
                        document
                          .getElementById("appointment-form")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      aria-label="Edit appointment"
                      className="grid size-9 place-items-center rounded-lg text-navy hover:bg-slate-100"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => remove(row.id)}
                      aria-label="Delete appointment"
                      className="grid size-9 place-items-center rounded-lg text-red hover:bg-red/10"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )}
                {row.source === "live_class" && row.meeting_url && (
                  <a
                    href={row.meeting_url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-lg bg-red px-3 py-2 text-xs font-bold text-white"
                  >
                    Join
                  </a>
                )}
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
    </>
  );
}
