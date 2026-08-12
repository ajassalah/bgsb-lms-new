"use client";
import { useMemo, useState } from "react";
import {
  BookOpen,
  CalendarClock,
  ClipboardList,
  GraduationCap,
  Radio,
  X,
} from "lucide-react";
import { BestCoursesCard } from "./best-courses-card";
type Session = {
  id: string;
  title: string;
  start: string;
  meetingUrl: string | null;
};
export function StudentDashboard({
  name,
  avatar,
  counts,
  bestCourses,
  sessions,
  showWelcome,
  welcomeCourse,
}: {
  name: string;
  avatar: string | null;
  counts: { courses: number; due: number; meetings: number };
  bestCourses: { title: string; enrollments: number }[];
  sessions: Session[];
  showWelcome: boolean;
  welcomeCourse: string;
}) {
  const [month, setMonth] = useState(new Date()),
    [welcomeOpen, setWelcomeOpen] = useState(showWelcome),
    days = useMemo(() => {
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
  const hour = Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Colombo",
        hour: "2-digit",
        hour12: false,
      }).format(new Date()),
    ),
    greeting =
      hour < 12
        ? "Good morning"
        : hour < 17
          ? "Good afternoon"
          : "Good evening",
    cards = [
      ["My Courses", counts.courses, BookOpen, "bg-violet-50 text-violet-600"],
      [
        "Due Assignments",
        counts.due,
        ClipboardList,
        "bg-amber-50 text-amber-600",
      ],
      [
        "Total Meetings",
        counts.meetings,
        Radio,
        "bg-emerald-50 text-emerald-600",
      ],
    ] as const;
  async function closeWelcome() {
    setWelcomeOpen(false);
    await fetch("/api/student/welcome", { method: "POST" }).catch(() => null);
  }
  return (
    <>
      {welcomeOpen && (
        <div className="fixed inset-0 z-[250] grid place-items-center bg-black/65 p-4 backdrop-blur-sm">
          <section className="relative w-full max-w-xl rounded-3xl border bg-white p-6 shadow-2xl sm:p-9">
            <button
              onClick={closeWelcome}
              aria-label="Close welcome message"
              className="absolute right-5 top-5 grid size-9 place-items-center rounded-full border text-slate-500 hover:bg-slate-50"
            >
              <X className="size-4" />
            </button>
            <span className="grid size-14 place-items-center rounded-2xl bg-red/10 text-red">
              <GraduationCap className="size-7" />
            </span>
            <h2 className="mt-6 pr-10 text-2xl font-bold text-navy">
              Welcome to BGSB, {name}! 🎓
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              We are pleased to confirm that your student account for{" "}
              <strong className="text-navy">{welcomeCourse}</strong> has been
              successfully created. Your journey with BGSB starts here, and we
              look forward to supporting you throughout your studies.
            </p>
            <button onClick={closeWelcome} className="btn-primary mt-7 w-full">
              Continue to Dashboard
            </button>
          </section>
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]">
        <section className="relative min-h-[360px] overflow-hidden rounded-2xl bg-navy p-8 text-white">
          <img
            src="/Thumimage.jpeg"
            className="absolute inset-0 size-full object-cover opacity-30 blur-[2px]"
            alt=""
          />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-white/60">
                  Sri Lanka Time
                </p>
                <b suppressHydrationWarning className="mt-3 block text-3xl">
                  {new Intl.DateTimeFormat("en-US", {
                    timeZone: "Asia/Colombo",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date())}
                </b>
              </div>
              {avatar && (
                <img
                  src={avatar}
                  className="size-24 rounded-2xl object-cover ring-4 ring-white/20"
                  alt=""
                />
              )}
            </div>
            <div>
              <p>Welcome back</p>
              <h1 suppressHydrationWarning className="mt-2 text-3xl font-bold">
                {greeting}, {name.split(" ")[0]}!
              </h1>
            </div>
          </div>
        </section>
        <section className="rounded-2xl border bg-white p-5">
          <div className="flex justify-between">
            <button
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1))
              }
            >
              ‹
            </button>
            <b>
              {month.toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </b>
            <button
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1))
              }
            >
              ›
            </button>
          </div>
          <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs">
            {"SMTWTFS".split("").map((x, i) => (
              <b key={i} className="py-2 text-slate-400">
                {x}
              </b>
            ))}
            {days.map((day, i) => (
              <span
                key={i}
                className={`rounded-lg py-2 ${day === new Date().getDate() && month.getMonth() === new Date().getMonth() ? "bg-red text-white" : ""}`}
              >
                {day}
              </span>
            ))}
          </div>
        </section>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {cards.map(([label, value, Icon, color]) => (
          <article key={label} className="rounded-2xl border bg-white p-5">
            <span
              className={`grid size-11 place-items-center rounded-xl ${color}`}
            >
              <Icon className="size-5" />
            </span>
            <b className="mt-4 block text-3xl text-navy">{value}</b>
            <p className="text-sm text-slate-500">{label}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <BestCoursesCard courses={bestCourses} empty="No enrolled courses." />
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
            <CalendarClock className="size-5" />
            Upcoming Sessions
          </h2>
          <div className="mt-5 space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <article key={session.id} className="rounded-xl border p-4">
                <b className="text-sm text-navy">{session.title}</b>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(session.start).toLocaleString("en-GB")}
                </p>
                {session.meetingUrl && (
                  <a
                    href={session.meetingUrl}
                    target="_blank"
                    className="mt-2 inline-block text-xs font-bold text-blue-600"
                  >
                    Join Session
                  </a>
                )}
              </article>
            ))}
            {!sessions.length && (
              <p className="text-sm text-slate-400">No upcoming sessions.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
