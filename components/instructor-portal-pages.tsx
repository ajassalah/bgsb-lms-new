"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreVertical,
  Radio,
  Search,
} from "lucide-react";
export function ReadOnlyTable({
  title,
  columns,
  rows,
  directView = false,
  portalLabel = "Instructor Portal",
}: {
  title: string;
  columns: string[];
  rows: { id: string; cells: React.ReactNode[]; view?: string }[];
  directView?: boolean;
  portalLabel?: string;
}) {
  const [q, setQ] = useState(""),
    [menu, setMenu] = useState<string | null>(null);
  const visible = useMemo(
    () =>
      rows.filter((x) =>
        x.cells.join(" ").toLowerCase().includes(q.toLowerCase()),
      ),
    [rows, q],
  );
  return (
    <>
      <p className="text-sm text-slate-400">{portalLabel}</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">{title}</h1>
      <section className="mt-7 overflow-visible rounded-2xl border bg-white">
        <label className="relative m-5 block max-w-lg">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="field pl-10"
            placeholder={`Search ${title.toLowerCase()}...`}
          />
        </label>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">#</th>
                {columns.map((x) => (
                  <th key={x} className="p-4">
                    {x}
                  </th>
                ))}
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((row, i) => (
                <tr key={row.id}>
                  {[i + 1, ...row.cells].map((cell, j) => (
                    <td key={j} className="max-w-sm p-4">
                      {cell}
                    </td>
                  ))}
                  <td className="relative p-4 text-right">
                    {directView && row.view ? (
                      <Link
                        href={row.view}
                        className="btn-secondary ml-auto gap-2"
                      >
                        <Eye className="size-4" /> View
                      </Link>
                    ) : (
                      <button
                        onClick={() => setMenu(menu === row.id ? null : row.id)}
                        className="ml-auto grid size-9 place-items-center rounded-lg border"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    )}
                    {!directView && menu === row.id && (
                      <div className="absolute right-4 top-14 z-[190] w-36 rounded-xl border bg-white p-1 text-left shadow-2xl">
                        {row.view ? (
                          <Link
                            href={row.view}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-50"
                          >
                            <Eye className="size-4" />
                            View
                          </Link>
                        ) : (
                          <span className="block px-3 py-2 text-xs text-slate-400">
                            View only
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="p-14 text-center text-slate-400"
                  >
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
export function InstructorLiveClasses({
  rows,
  appointmentUrl,
}: {
  rows: {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    start: string;
    end: string;
    url: string | null;
  }[];
  appointmentUrl?: string;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const section = (title: string, items: typeof rows) => (
    <section className="mt-6 px-3 sm:px-0">
      <h2 className="rounded-xl bg-white px-5 py-4 text-lg font-bold text-navy">
        {title}
      </h2>
      <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((x) => (
          <article
            key={x.id}
            className="min-w-0 overflow-hidden rounded-2xl border bg-white shadow-sm"
          >
            {x.thumbnail ? (
              <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-slate-100">
                <img
                  src={x.thumbnail}
                  alt=""
                  className="block size-full object-cover"
                />
              </div>
            ) : (
              <div className="grid h-44 place-items-center bg-slate-100">
                <Radio className="size-8 text-slate-300" />
              </div>
            )}
            <div className="p-5">
              <h3 className="font-bold text-navy">{x.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                {x.description}
              </p>
              <p className="mt-3 text-xs font-semibold text-slate-400">
                {new Date(x.start).toLocaleString("en-GB")}
              </p>
              {x.url && (
                <a
                  href={x.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary mt-4"
                >
                  Join Class
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Instructor Portal</p>
          <h1 className="mt-1 text-2xl font-bold text-navy">Live Classes</h1>
        </div>
        {appointmentUrl && (
          <Link href={appointmentUrl} className="btn-primary gap-2">
            <CalendarPlus className="size-4" />
            Create Appointment
          </Link>
        )}
      </div>
      {section(
        "Scheduled Classes",
        rows.filter((x) => new Date(x.end).getTime() >= now),
      )}
      {section(
        "Expired Classes",
        rows.filter((x) => new Date(x.end).getTime() < now),
      )}
    </>
  );
}
export function InstructorCalendar({
  events,
}: {
  events: { id: string; title: string; start: string; url: string | null }[];
}) {
  const [month, setMonth] = useState(new Date());
  const days = useMemo(
    () => [
      ...Array.from(
        { length: new Date(month.getFullYear(), month.getMonth(), 1).getDay() },
        () => null,
      ),
      ...Array.from(
        {
          length: new Date(
            month.getFullYear(),
            month.getMonth() + 1,
            0,
          ).getDate(),
        },
        (_, i) => i + 1,
      ),
    ],
    [month],
  );
  const key = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Colombo",
    }).format(d);
  return (
    <>
      <p className="text-sm text-slate-400">Instructor Portal</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">Calendar</h1>
      <div className="mt-7 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <b className="text-navy">
              {month.toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </b>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setMonth(new Date(month.getFullYear(), month.getMonth() - 1))
                }
                className="grid size-9 place-items-center rounded-lg border"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={() =>
                  setMonth(new Date(month.getFullYear(), month.getMonth() + 1))
                }
                className="grid size-9 place-items-center rounded-lg border"
              >
                <ChevronRight />
              </button>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-2 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((x) => (
              <small key={x} className="text-slate-400">
                {x}
              </small>
            ))}
            {days.map((day, i) => {
              const k = day
                ? `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                : "";
              const has = events.some((x) => key(new Date(x.start)) === k);
              return (
                <div
                  key={i}
                  className="relative grid h-12 place-items-center rounded-lg border border-slate-100"
                >
                  {day}
                  {has && (
                    <span className="absolute bottom-1 size-1.5 rounded-full bg-red" />
                  )}
                </div>
              );
            })}
          </div>
        </section>
        <section className="rounded-2xl border bg-white p-5">
          <h2 className="flex items-center gap-2 font-bold text-navy">
            <CalendarDays className="size-5 text-red" />
            All Scheduled Events
          </h2>
          <div className="mt-4 max-h-[480px] space-y-3 overflow-y-auto">
            {events.map((x) => (
              <div key={x.id} className="rounded-xl bg-slate-50 p-4">
                <b className="text-sm text-navy">{x.title}</b>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(x.start).toLocaleString("en-GB")}
                </p>
                {x.url && (
                  <a
                    href={x.url}
                    target="_blank"
                    className="mt-2 inline-block text-xs font-bold text-red"
                  >
                    Join
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
