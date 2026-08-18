"use client";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Radio,
  Users,
  X,
} from "lucide-react";
type Session = {
  id: string;
  title: string;
  description: string;
  start: string;
  meetingUrl: string | null;
};
export function InstructorDashboard({
  name,
  avatar,
  counts,
  bestCourses,
  sessions,
  showWelcome,
}: {
  name: string;
  avatar: string | null;
  counts: {
    students: number;
    assignedCourses: number;
    publishedCourses: number;
    liveSessions: number;
  };
  bestCourses: { title: string; enrollments: number }[];
  sessions: Session[];
  showWelcome: boolean;
}) {
  const [now, setNow] = useState(() => new Date()),
    [month, setMonth] = useState(() => new Date()),
    [videoFinished, setVideoFinished] = useState(false),
    [welcomeOpen, setWelcomeOpen] = useState(showWelcome);
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  const hour = Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Colombo",
        hour: "2-digit",
        hour12: false,
      }).format(now),
    ),
    greeting =
      hour < 12
        ? "Good morning"
        : hour < 17
          ? "Good afternoon"
          : "Good evening",
    first = name.split(/\s+/)[0];
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
  const cards = [
    ["Total Students", counts.students, Users, "bg-blue-50 text-blue-600"],
    [
      "Assigned Courses",
      counts.assignedCourses,
      BookOpen,
      "bg-violet-50 text-violet-600",
    ],
    [
      "Published Courses",
      counts.publishedCourses,
      BookOpen,
      "bg-amber-50 text-amber-600",
    ],
    [
      "Total Live Sessions",
      counts.liveSessions,
      Radio,
      "bg-emerald-50 text-emerald-600",
    ],
  ] as const;
  const dateKey = (date: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Colombo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  async function closeWelcome() {
    setWelcomeOpen(false);
    await fetch("/api/instructor/welcome", { method: "POST" }).catch(
      () => null,
    );
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
            <p className="mt-6 font-bold text-red">
              👋 Welcome to Your Instructor Dashboard!
            </p>
            <h2 className="mt-2 pr-10 text-2xl font-bold text-navy">
              Welcome, {name}!
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Your instructor dashboard is ready. Here you can manage your
              courses, learning materials, assignments, students, and academic
              activities.
            </p>
            <p className="mt-4 leading-7 text-slate-600">
              We&apos;re happy to have you as part of the{" "}
              <strong className="text-navy">BGSB academic team</strong>. 🎓
            </p>
            <button onClick={closeWelcome} className="btn-primary mt-7 w-full">
              Get Started
            </button>
          </section>
        </div>
      )}
      <div>
        <p className="text-sm text-slate-400">Overview</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">
          Instructor Dashboard
        </h1>
      </div>
      <section className="relative mt-6 min-h-[390px] overflow-hidden rounded-2xl bg-navy text-white sm:min-h-[440px]">
        {videoFinished ? (
          <img
            src="/Thumimage.jpeg"
            alt=""
            className="absolute inset-0 size-full scale-105 object-cover blur-[2px]"
          />
        ) : (
          <video
            autoPlay
            muted
            playsInline
            preload="auto"
            poster="/Thumimage.jpeg"
            onEnded={() => setVideoFinished(true)}
            onError={() => setVideoFinished(true)}
            className="absolute inset-0 size-full object-cover object-center"
          >
            <source src="/thum_video.mp4" type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-navy/55 backdrop-blur-[2px]" />
        <div className="relative flex min-h-[390px] flex-col justify-between p-6 sm:min-h-[440px] sm:p-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-200">
                Sri Lanka Time
              </p>
              <b suppressHydrationWarning className="mt-2 block text-3xl">
                {new Intl.DateTimeFormat("en-US", {
                  timeZone: "Asia/Colombo",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(now)}
              </b>
              <span suppressHydrationWarning className="text-sm text-blue-100">
                {new Intl.DateTimeFormat("en-US", {
                  timeZone: "Asia/Colombo",
                  dateStyle: "full",
                }).format(now)}
              </span>
            </div>
            {avatar ? (
              <img
                src={avatar}
                alt=""
                className="size-20 rounded-2xl border-2 border-white/30 object-cover sm:size-24"
              />
            ) : (
              <span className="grid size-20 place-items-center rounded-2xl bg-white/15 text-3xl font-bold sm:size-24">
                {name[0]}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm text-blue-100">Welcome back</p>
            <h2 suppressHydrationWarning className="mt-1 text-3xl font-bold">
              {greeting}, {first}!
            </h2>
            <p className="mt-2 text-sm text-blue-100">
              Here is your teaching activity and today&apos;s scheduled learning
              overview.
            </p>
          </div>
        </div>
      </section>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, color]) => (
          <div
            key={label}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <span
              className={`grid size-11 place-items-center rounded-xl ${color}`}
            >
              <Icon className="size-5" />
            </span>
            <p className="mt-4 text-sm text-slate-500">{label}</p>
            <b className="text-2xl text-navy">{value}</b>
          </div>
        ))}
      </div>
      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[1.65fr_.75fr]">
        <section className="min-w-0 overflow-hidden rounded-xl border bg-white p-4 sm:p-6">
          <h2 className="font-bold text-[#17233c]">Best Courses</h2>
          <p className="mt-1 text-xs text-slate-400">
            Top five assigned courses by student enrollments
          </p>
          <div className="mt-4 divide-y">
            {bestCourses.map((x, i) => (
              <div key={x.title} className="flex items-center gap-3 py-4">
                <span className="grid size-9 place-items-center rounded-lg bg-navy text-xs font-bold text-white">
                  {i + 1}
                </span>
                <b className="min-w-0 flex-1 truncate text-sm text-navy">
                  {x.title}
                </b>
                <span className="shrink-0 rounded-full bg-red/10 px-3 py-1 text-xs font-bold text-red">
                  Enroll · {x.enrollments}
                </span>
              </div>
            ))}
            {!bestCourses.length && (
              <p className="py-8 text-center text-sm text-slate-400">
                No assigned courses yet.
              </p>
            )}
          </div>
        </section>
        <section className="rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy">Calendar</h2>
            <div className="flex gap-1">
              <button
                onClick={() =>
                  setMonth(new Date(month.getFullYear(), month.getMonth() - 1))
                }
                className="grid size-8 place-items-center rounded-lg border"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                onClick={() =>
                  setMonth(new Date(month.getFullYear(), month.getMonth() + 1))
                }
                className="grid size-8 place-items-center rounded-lg border"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
          <b className="mt-3 block text-sm text-slate-600">
            {month.toLocaleString("en-US", { month: "long", year: "numeric" })}
          </b>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs">
            {["S", "M", "T", "W", "T", "F", "S"].map((x, i) => (
              <span key={`${x}-${i}`} className="py-1 text-slate-400">
                {x}
              </span>
            ))}
            {days.map((day, i) => {
              const key = day
                ? `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                : "";
              const has = sessions.some(
                (x) => dateKey(new Date(x.start)) === key,
              );
              const dayEvents = sessions.filter(
                (x) => dateKey(new Date(x.start)) === key,
              );
              return (
                <span
                  key={i}
                  title={dayEvents
                    .map(
                      (event) =>
                        `${event.title} — ${new Date(event.start).toLocaleString("en-LK", { timeZone: "Asia/Colombo" })}${event.description ? ` — ${event.description}` : ""}`,
                    )
                    .join("\n")}
                  className={`relative grid h-7 place-items-center rounded-md ${day && dateKey(now) === key ? "bg-red text-white" : ""}`}
                >
                  {day}
                  {has && (
                    <i className="absolute bottom-1 size-1 rounded-full bg-blue-500" />
                  )}
                </span>
              );
            })}
          </div>
        </section>
      </div>
      <section className="mt-5 min-h-[430px] rounded-2xl border bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
          <CalendarClock className="size-5 text-red" />
          Upcoming Sessions
        </h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {sessions
            .filter((x) => new Date(x.start) >= now)
            .sort((a, b) => +new Date(a.start) - +new Date(b.start))
            .slice(0, 5)
            .map((x) => (
              <div key={x.id} className="rounded-xl border bg-slate-50 p-4">
                <b className="text-navy">{x.title}</b>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(x.start).toLocaleString("en-GB")}
                </p>
                {x.meetingUrl && (
                  <a
                    href={x.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-xs font-bold text-red"
                  >
                    Join Live Class
                  </a>
                )}
              </div>
            ))}
          {!sessions.some((x) => new Date(x.start) >= now) && (
            <p className="text-sm text-slate-400">No upcoming sessions.</p>
          )}
        </div>
      </section>
    </>
  );
}
