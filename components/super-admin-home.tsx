"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MoreHorizontal,
  UserPlus,
  Users,
  ChevronLeft,
  ChevronRight,
  PartyPopper,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

type Counts = {
  students: number;
  instructors: number;
  courses: number;
  organizations: number;
  enrollments: number;
  completed: number;
};
export function SuperAdminHome({
  counts,
  bestCourses,
  manpower,
  movement,
  admin,
  appointments,
  recentActivity,
  upcomingSessions,
  staffWelcome,
  basePath = "/dashboard/super-admin",
  dashboardTitle = "Admin Dashboard",
  showRecentActivity = true,
}: {
  counts: Counts;
  bestCourses: { title: string; enrollments: number }[];
  manpower: { users: number; admins: number };
  movement: { students: string[]; instructors: string[]; courses: string[] };
  admin: { name: string; avatarUrl: string | null };
  appointments: {
    id: string;
    title: string;
    start: string;
    end: string;
    status: string;
    meetingUrl: string | null;
  }[];
  recentActivity: {
    id: string;
    name: string;
    avatar: string | null;
    event: string;
    date: string;
  }[];
  upcomingSessions: {
    id: string;
    title: string;
    start: string;
    meetingUrl: string | null;
  }[];
  staffWelcome?: { show: boolean; role: string };
  basePath?: string;
  dashboardTitle?: string;
  showRecentActivity?: boolean;
}) {
  const [now, setNow] = useState(() => new Date());
  const [month, setMonth] = useState(() => new Date());
  const [videoFinished, setVideoFinished] = useState(false);
  const [staffWelcomeOpen, setStaffWelcomeOpen] = useState(
    !!staffWelcome?.show,
  );
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const sriLankaHour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Colombo",
      hour: "2-digit",
      hour12: false,
    }).format(now),
  );
  const greeting =
    sriLankaHour < 12
      ? "Good morning"
      : sriLankaHour < 17
        ? "Good afternoon"
        : "Good evening";
  async function closeStaffWelcome() {
    setStaffWelcomeOpen(false);
    await fetch("/api/staff/welcome", { method: "POST" }).catch(() => null);
  }
  const firstName = admin.name.trim().split(/\s+/)[0] || "Administrator";
  const calendarDays = useMemo(() => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstWeekday = new Date(year, monthIndex, 1).getDay();
    const days = new Date(year, monthIndex + 1, 0).getDate();
    return [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: days }, (_, index) => index + 1),
    ];
  }, [month]);
  const eventsForDay = (day: number) =>
    appointments.filter((item) => {
      const dateParts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Colombo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(item.start));
      return (
        dateParts ===
        `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      );
    });
  const upcomingAppointments = appointments
    .filter((item) => new Date(item.start) >= now)
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));
  const cards = [
    [
      "Total students",
      counts.students,
      Users,
      "+12.5%",
      true,
      movement.students,
    ],
    [
      "Instructors",
      counts.instructors,
      GraduationCap,
      "+4.2%",
      true,
      movement.instructors,
    ],
    [
      "Published courses",
      counts.courses,
      BookOpen,
      "+2.8%",
      true,
      movement.courses,
    ],
  ] as const;
  const max = Math.max(
    counts.students,
    counts.instructors,
    counts.courses,
    counts.organizations,
    1,
  );
  const bars = [
    counts.students,
    Math.max(1, Math.round(counts.students * 0.72)),
    Math.max(1, Math.round(counts.students * 0.84)),
    Math.max(1, Math.round(counts.students * 0.65)),
    Math.max(1, Math.round(counts.students * 0.92)),
    Math.max(1, counts.enrollments),
    Math.max(1, Math.round(counts.enrollments * 1.1)),
  ];
  return (
    <>
      {staffWelcomeOpen && (
        <div className="fixed inset-0 z-[250] grid place-items-center bg-black/65 p-4 backdrop-blur-sm">
          <section className="relative w-full max-w-xl rounded-3xl border bg-white p-6 shadow-2xl sm:p-9">
            <button
              onClick={closeStaffWelcome}
              aria-label="Close welcome message"
              className="absolute right-5 top-5 grid size-9 place-items-center rounded-full border text-slate-500"
            >
              <X className="size-4" />
            </button>
            <span className="grid size-14 place-items-center rounded-2xl bg-red/10 text-red">
              <PartyPopper className="size-7" />
            </span>
            <p className="mt-6 font-bold text-red">🎉 Welcome to BGSB LMS!</p>
            <h2 className="mt-2 text-2xl font-bold text-navy">
              Welcome, {admin.name}!
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Your{" "}
              <strong className="text-navy">
                {staffWelcome?.role || "Staff"}
              </strong>{" "}
              account is ready.
            </p>
            <p className="mt-3 leading-7 text-slate-600">
              You can now access the LMS features and tools available to your
              role.
            </p>
            <p className="mt-3 leading-7 text-slate-600">
              Take a moment to explore your dashboard and get familiar with your
              workspace.
            </p>
            <p className="mt-4 font-bold text-navy">
              We&apos;re glad to have you on the BGSB LMS team!
            </p>
            <button
              onClick={closeStaffWelcome}
              className="btn-primary mt-7 w-full"
            >
              Get Started
            </button>
          </section>
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Overview</p>
          <h1 className="mt-1 text-2xl font-bold text-[#17233c]">
            {dashboardTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor learning activity and manage the BGSB platform.
          </p>
        </div>
        <button className="btn-primary gap-2 rounded-lg px-4 py-2.5">
          <UserPlus className="size-4" />
          Add new user
        </button>
      </div>
      <div className="flex flex-col">
        <div className="order-2 mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(([label, value, Icon, delta, up, dates], i) => (
            <div className="rounded-xl border bg-white p-5" key={label}>
              <div className="flex items-start justify-between">
                <span
                  className={`grid size-11 place-items-center rounded-xl ${["bg-blue-50 text-blue-600", "bg-violet-50 text-violet-600", "bg-amber-50 text-amber-600", "bg-emerald-50 text-emerald-600"][i]}`}
                >
                  <Icon className="size-5" />
                </span>
                <button className="text-slate-300">
                  <MoreHorizontal className="size-5" />
                </button>
              </div>
              <p className="mt-5 text-sm text-slate-500">{label}</p>
              <div className="mt-1 flex items-end justify-between">
                <b className="text-2xl text-[#17233c]">
                  {value.toLocaleString()}
                </b>
                <span
                  className={`flex items-center text-xs font-semibold ${up ? "text-emerald-600" : "text-red-500"}`}
                >
                  {up ? (
                    <ArrowUpRight className="size-3.5" />
                  ) : (
                    <ArrowDownRight className="size-3.5" />
                  )}
                  {delta}
                </span>
              </div>
              <div className="mt-3 h-14">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={Array.from({ length: 7 }, (_, index) => {
                      const date = new Date();
                      date.setMonth(date.getMonth() - 6 + index, 1);
                      const next = new Date(
                        date.getFullYear(),
                        date.getMonth() + 1,
                        1,
                      );
                      return {
                        day: date.toLocaleDateString("en-GB", {
                          month: "short",
                        }),
                        value: dates.filter((item) => {
                          const created = new Date(item);
                          return created >= date && created < next;
                        }).length,
                      };
                    })}
                  >
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        fontSize: 10,
                        padding: 6,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={["#2563eb", "#7c3aed", "#d97706"][i]}
                      fill={["#dbeafe", "#ede9fe", "#fef3c7"][i]}
                      strokeWidth={2}
                      activeDot={{ r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
        <div className="order-1 mt-7 grid gap-5 xl:grid-cols-[3fr_1fr]">
          <section className="relative min-h-[300px] overflow-hidden rounded-2xl bg-navy p-7 text-white shadow-sm sm:p-9">
            <img
              src="/Thumimage.jpeg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 size-full scale-105 object-cover blur-[3px]"
            />
            <video
              src="/thum_video.mp4"
              poster="/Thumimage.jpeg"
              autoPlay
              muted
              playsInline
              onEnded={() => setVideoFinished(true)}
              onError={() => setVideoFinished(true)}
              className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${videoFinished ? "opacity-0" : "opacity-100"}`}
            />
            <div className="absolute inset-0 bg-navy/70" />
            <div className="absolute -right-16 -top-20 size-64 rounded-full bg-red/25" />
            <div className="absolute -bottom-24 -left-16 size-64 rounded-full bg-white/5" />
            <div className="relative flex h-full flex-col justify-between gap-10">
              <div className="flex items-start justify-between gap-5">
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4 backdrop-blur-md sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                    Sri Lanka time
                  </p>
                  <p
                    suppressHydrationWarning
                    className="mt-3 text-3xl font-bold sm:text-4xl"
                  >
                    {new Intl.DateTimeFormat("en-LK", {
                      timeZone: "Asia/Colombo",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }).format(now)}
                  </p>
                  <p
                    suppressHydrationWarning
                    className="mt-2 text-sm text-white/60"
                  >
                    {new Intl.DateTimeFormat("en-LK", {
                      timeZone: "Asia/Colombo",
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(now)}
                  </p>
                </div>
                {admin.avatarUrl ? (
                  <img
                    src={admin.avatarUrl}
                    alt={admin.name}
                    className="size-28 rounded-2xl border-2 border-white/30 object-cover shadow-2xl sm:size-36"
                  />
                ) : (
                  <span className="grid size-28 place-items-center rounded-2xl bg-white/10 text-4xl font-bold shadow-2xl sm:size-36">
                    {firstName[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm text-white/55">Welcome back</p>
                <h2
                  suppressHydrationWarning
                  className="mt-2 text-3xl font-bold sm:text-4xl"
                >
                  {greeting}, {firstName}!
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/65">
                  Here is your time breakdown and today&apos;s scheduled
                  learning activity.
                </p>
              </div>
            </div>
          </section>

          <section className="flex h-[520px] min-h-0 flex-col overflow-hidden rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-navy">Calendar</h2>
                <p className="mt-1 text-[10px] text-slate-400">
                  Scheduled appointments
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label="Previous month"
                  onClick={() =>
                    setMonth(
                      new Date(month.getFullYear(), month.getMonth() - 1, 1),
                    )
                  }
                  className="grid size-7 place-items-center rounded-md border text-slate-500 hover:bg-slate-50"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <b className="min-w-20 text-center text-[11px] text-navy">
                  {month.toLocaleDateString("en-GB", {
                    month: "short",
                    year: "numeric",
                  })}
                </b>
                <button
                  aria-label="Next month"
                  onClick={() =>
                    setMonth(
                      new Date(month.getFullYear(), month.getMonth() + 1, 1),
                    )
                  }
                  className="grid size-7 place-items-center rounded-md border text-slate-500 hover:bg-slate-50"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-3 grid shrink-0 grid-cols-7 gap-0.5 text-center text-[8px] font-bold uppercase text-slate-400">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span className="py-2" key={day}>
                  {day}
                </span>
              ))}
              {calendarDays.map((day, index) => {
                const events = day ? eventsForDay(day) : [];
                const isToday =
                  day ===
                    Number(
                      new Intl.DateTimeFormat("en-US", {
                        timeZone: "Asia/Colombo",
                        day: "numeric",
                      }).format(now),
                    ) &&
                  month.getMonth() ===
                    Number(
                      new Intl.DateTimeFormat("en-US", {
                        timeZone: "Asia/Colombo",
                        month: "numeric",
                      }).format(now),
                    ) -
                      1 &&
                  month.getFullYear() ===
                    Number(
                      new Intl.DateTimeFormat("en-US", {
                        timeZone: "Asia/Colombo",
                        year: "numeric",
                      }).format(now),
                    );
                return (
                  <div
                    onClick={() =>
                      day &&
                      window.location.assign(
                        `${basePath}/calendar?date=${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
                      )
                    }
                    key={`${day}-${index}`}
                    title={
                      day
                        ? `Book an appointment${events.length ? ` · ${events.length} scheduled event${events.length === 1 ? "" : "s"}` : ""}`
                        : ""
                    }
                    className={`relative min-h-8 rounded-md border p-0.5 text-left ${day ? "cursor-pointer bg-white hover:border-red" : "border-transparent bg-slate-50/50"} ${isToday ? "border-red ring-1 ring-red/20" : "border-slate-100"}`}
                  >
                    {day && (
                      <>
                        <span
                          className={`grid size-4 place-items-center rounded-full text-[8px] ${isToday ? "bg-red font-bold text-white" : "text-slate-600"}`}
                        >
                          {day}
                        </span>
                        {events.length > 0 && (
                          <span className="mx-auto mt-0.5 block size-1.5 rounded-full bg-red" />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex min-h-0 flex-1 flex-col border-t pt-3">
              <div className="flex items-center justify-between">
                <b className="text-sm text-navy">Upcoming events</b>
                <a
                  href={`${basePath}/calendar`}
                  className="text-xs font-semibold text-red"
                >
                  View calendar
                </a>
              </div>
              <div className="mt-2 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
                {upcomingAppointments.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2.5"
                  >
                    <span
                      className={`size-2 shrink-0 rounded-full ${event.status === "appointment" ? "bg-red" : "bg-blue-500"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-navy">
                        {event.title}
                      </span>
                      <span className="mt-0.5 block text-[9px] font-semibold text-slate-400">
                        {event.status === "appointment"
                          ? "Appointment"
                          : "Live class"}{" "}
                        ·{" "}
                        {new Date(event.start).toLocaleString("en-LK", {
                          timeZone: "Asia/Colombo",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {event.meetingUrl && (
                      <a
                        href={event.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-md bg-red px-2 py-1 text-[10px] font-bold text-white"
                      >
                        Join
                      </a>
                    )}
                  </div>
                ))}
                {!upcomingAppointments.length && (
                  <p className="py-2 text-center text-[9px] text-slate-400">
                    No upcoming events
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <section className="min-w-0 overflow-hidden rounded-xl border bg-white p-4 sm:p-6">
          <h2 className="font-bold text-[#17233c]">Best Courses</h2>
          <p className="mt-1 text-xs text-slate-400">
            Top five courses by student enrollments
          </p>
          <div className="mt-5 divide-y">
            {bestCourses.map((course, index) => (
              <div
                key={course.title}
                className="flex min-w-0 items-center gap-2 py-3 sm:gap-4"
              >
                <span className="grid size-9 place-items-center rounded-lg bg-navy text-xs font-bold text-white">
                  {index + 1}
                </span>
                <b className="min-w-0 flex-1 truncate text-sm text-navy">
                  {course.title}
                </b>
                <span className="shrink-0 rounded-full bg-red/10 px-2 py-1 text-[10px] font-bold text-red sm:px-3 sm:text-xs">
                  Enroll · {course.enrollments}
                </span>
              </div>
            ))}
            {!bestCourses.length && (
              <p className="py-8 text-center text-sm text-slate-400">
                No enrollment data available.
              </p>
            )}
          </div>
        </section>
        <section className="min-w-0 overflow-hidden rounded-xl border bg-white p-4 sm:p-6">
          <h2 className="font-bold text-[#17233c]">Manpower Information</h2>
          <p className="mt-1 text-xs text-slate-400">
            Current platform user totals
          </p>
          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-blue-50 p-5">
              <p className="text-sm font-semibold text-blue-700">Users</p>
              <b className="mt-2 block text-3xl text-navy">{manpower.users}</b>
            </div>
            <div className="rounded-xl bg-violet-50 p-5">
              <p className="text-sm font-semibold text-violet-700">
                Total Admin
              </p>
              <b className="mt-2 block text-3xl text-navy">{manpower.admins}</b>
            </div>
          </div>
        </section>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <section className="rounded-xl border bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-[#17233c]">Enrollment overview</h2>
              <p className="mt-1 text-xs text-slate-400">
                Student enrollment activity this week
              </p>
            </div>
            <select className="rounded-lg border px-3 py-2 text-xs text-slate-500">
              <option>Last 7 days</option>
            </select>
          </div>
          <div className="mt-8 flex h-60 items-end gap-3 border-b border-l px-4">
            {bars.map((bar, i) => (
              <div className="group flex h-full flex-1 items-end" key={i}>
                <div
                  className="w-full rounded-t-md bg-navy/90 transition hover:bg-red"
                  style={{
                    height: `${Math.max(10, (bar / Math.max(max, ...bars)) * 100)}%`,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-7 text-center text-[10px] text-slate-400">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((x) => (
              <span key={x}>{x}</span>
            ))}
          </div>
        </section>
        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-bold text-[#17233c]">Course completion</h2>
          <p className="mt-1 text-xs text-slate-400">
            Overall learner performance
          </p>
          <div
            className="mx-auto mt-8 grid size-40 place-items-center rounded-full"
            style={{
              background: `conic-gradient(#c62828 ${counts.enrollments ? Math.round((counts.completed / counts.enrollments) * 100) : 0}%, #eef1f5 0)`,
            }}
          >
            <div className="grid size-28 place-items-center rounded-full bg-white text-center">
              <span>
                <b className="block text-3xl text-[#17233c]">
                  {counts.enrollments
                    ? Math.round((counts.completed / counts.enrollments) * 100)
                    : 0}
                  %
                </b>
                <small className="text-slate-400">Completed</small>
              </span>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-slate-50 p-3">
              <b>{counts.enrollments}</b>
              <p className="text-[10px] text-slate-400">Enrollments</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <b>{counts.completed}</b>
              <p className="text-[10px] text-slate-400">Completed</p>
            </div>
          </div>
        </section>
      </div>
      <div
        className={`mt-5 grid gap-5 ${showRecentActivity ? "xl:grid-cols-[1.65fr_1fr]" : "xl:grid-cols-1"}`}
      >
        {showRecentActivity && (
          <section className="rounded-xl border bg-white">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="font-bold text-[#17233c]">Recent activity</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Latest platform events
                </p>
              </div>
              <button className="text-xs font-semibold text-red">
                View all
              </button>
            </div>
            <div className="divide-y">
              {recentActivity.map((activity) => (
                <div
                  className="flex items-center gap-4 px-4 py-4 sm:px-6"
                  key={activity.id}
                >
                  {activity.avatar ? (
                    <img
                      src={activity.avatar}
                      alt=""
                      className="size-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-navy">
                      {activity.name
                        .split(/\s+/)
                        .map((x) => x[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <b className="block text-sm text-[#17233c]">
                      {activity.name}
                    </b>
                    <p className="truncate text-xs text-slate-500">
                      {activity.event}
                    </p>
                  </div>
                  <span className="hidden text-[11px] text-slate-400 sm:block">
                    {new Date(activity.date).toLocaleString("en-LK", {
                      timeZone: "Asia/Colombo",
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
              {!recentActivity.length && (
                <p className="p-8 text-center text-sm text-slate-400">
                  No recent activity.
                </p>
              )}
            </div>
          </section>
        )}
        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-bold text-[#17233c]">Upcoming sessions</h2>
          <p className="mt-1 text-xs text-slate-400">Classes scheduled next</p>
          {upcomingSessions.map((session, i) => (
            <div className="mt-5 flex items-center gap-3" key={session.id}>
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-lg ${i === 0 ? "bg-red text-white" : "bg-slate-100 text-navy"}`}
              >
                <CalendarClock className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <b className="block truncate text-sm text-[#17233c]">
                  {session.title}
                </b>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock3 className="size-3" />
                  {new Date(session.start).toLocaleString("en-LK", {
                    timeZone: "Asia/Colombo",
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {session.meetingUrl && (
                <a
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-red px-3 py-2 text-xs font-bold text-white"
                >
                  Join
                </a>
              )}
            </div>
          ))}
          {!upcomingSessions.length && (
            <p className="py-8 text-center text-sm text-slate-400">
              No upcoming sessions.
            </p>
          )}
          {false &&
            [
              ["Strategic Leadership", "Today · 4:00 PM"],
              ["Digital Marketing", "Tomorrow · 10:30 AM"],
              ["Financial Management", "Fri · 2:00 PM"],
            ].map(([title, time], i) => (
              <div className="mt-5 flex gap-3" key={title}>
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-lg ${i === 0 ? "bg-red text-white" : "bg-slate-100 text-navy"}`}
                >
                  <CalendarClock className="size-4" />
                </span>
                <div>
                  <b className="block text-sm text-[#17233c]">{title}</b>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock3 className="size-3" />
                    {time}
                  </span>
                </div>
              </div>
            ))}
          <a
            href={`${basePath}/calendar`}
            className="mt-6 block w-full rounded-lg border py-2.5 text-center text-xs font-semibold text-navy"
          >
            Open calendar
          </a>
        </section>
      </div>
    </>
  );
}
