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
} from "lucide-react";

type Counts = {
  students: number;
  instructors: number;
  courses: number;
  organizations: number;
  enrollments: number;
  completed: number;
};
const recent = [
  ["Olivia Martin", "Enrolled in Strategic Leadership", "2 minutes ago", "OM"],
  ["Daniel Silva", "Completed Financial Management", "18 minutes ago", "DS"],
  ["Aisha Rahman", "Joined Digital Marketing Strategy", "1 hour ago", "AR"],
  ["Marcus Lee", "Submitted an assignment", "3 hours ago", "ML"],
];

export function SuperAdminHome({
  counts,
  bestCourses,
  manpower,
}: {
  counts: Counts;
  bestCourses: { title: string; enrollments: number }[];
  manpower: { users: number; admins: number };
}) {
  const cards = [
    ["Total students", counts.students, Users, "+12.5%", true],
    ["Instructors", counts.instructors, GraduationCap, "+4.2%", true],
    ["Published courses", counts.courses, BookOpen, "+2.8%", true],
    ["Organizations", counts.organizations, Building2, "-0.4%", false],
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Overview</p>
          <h1 className="mt-1 text-2xl font-bold text-[#17233c]">
            Admin Dashboard
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
      <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, delta, up], i) => (
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
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-bold text-[#17233c]">Best Courses</h2>
          <p className="mt-1 text-xs text-slate-400">
            Top five courses by student enrollments
          </p>
          <div className="mt-5 divide-y">
            {bestCourses.map((course, index) => (
              <div key={course.title} className="flex items-center gap-4 py-3">
                <span className="grid size-9 place-items-center rounded-lg bg-navy text-xs font-bold text-white">
                  {index + 1}
                </span>
                <b className="min-w-0 flex-1 truncate text-sm text-navy">
                  {course.title}
                </b>
                <span className="rounded-full bg-red/10 px-3 py-1 text-xs font-bold text-red">
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
        <section className="rounded-xl border bg-white p-6">
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
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <section className="rounded-xl border bg-white">
          <div className="flex items-center justify-between border-b px-6 py-5">
            <div>
              <h2 className="font-bold text-[#17233c]">Recent activity</h2>
              <p className="mt-1 text-xs text-slate-400">
                Latest platform events
              </p>
            </div>
            <button className="text-xs font-semibold text-red">View all</button>
          </div>
          <div className="divide-y">
            {recent.map(([name, event, time, initials]) => (
              <div className="flex items-center gap-4 px-6 py-4" key={name}>
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-navy">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block text-sm text-[#17233c]">{name}</b>
                  <p className="truncate text-xs text-slate-500">{event}</p>
                </div>
                <span className="hidden text-[11px] text-slate-400 sm:block">
                  {time}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-bold text-[#17233c]">Upcoming sessions</h2>
          <p className="mt-1 text-xs text-slate-400">Classes scheduled next</p>
          {[
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
          <button className="mt-6 w-full rounded-lg border py-2.5 text-xs font-semibold text-navy">
            Open calendar
          </button>
        </section>
      </div>
    </>
  );
}
