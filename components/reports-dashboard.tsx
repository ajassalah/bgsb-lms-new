"use client";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  Users,
} from "lucide-react";

type Enrollment = {
  id: string;
  date: string;
  courseId: string;
  course: string;
};
type Course = { id: string; title: string; date: string };
type LiveClass = { id: string; date: string };
const colors = [
  "#C62828",
  "#0A2647",
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#d97706",
  "#db2777",
  "#0891b2",
];
const key = (value: string) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export function ReportsDashboard({
  enrollments,
  courses,
  liveClasses,
}: {
  enrollments: Enrollment[];
  courses: Course[];
  liveClasses: LiveClass[];
}) {
  const now = new Date(),
    [selectedMonth, setSelectedMonth] = useState(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    ),
    [chart, setChart] = useState<"bar" | "pie">("bar");
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1),
          id = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return {
          id,
          label: d.toLocaleDateString("en-GB", {
            month: "short",
            year: "numeric",
          }),
          short: d.toLocaleDateString("en-GB", { month: "short" }),
        };
      }),
    [],
  );
  const movement = useMemo(
    () =>
      months.map((m) => ({
        month: m.short,
        enrollments: enrollments.filter((x) => key(x.date) === m.id).length,
        courses: courses.filter((x) => key(x.date) === m.id).length,
        classes: liveClasses.filter((x) => key(x.date) === m.id).length,
      })),
    [months, enrollments, courses, liveClasses],
  );
  const selected = useMemo(() => {
    const enrolled = enrollments.filter((x) => key(x.date) === selectedMonth),
      created = courses.filter((x) => key(x.date) === selectedMonth);
    const counts = new Map<string, { name: string; value: number }>();
    enrolled.forEach((x) =>
      counts.set(x.courseId, {
        name: x.course,
        value: (counts.get(x.courseId)?.value || 0) + 1,
      }),
    );
    return {
      enrollments: enrolled.length,
      courses: created.length,
      top: Array.from(counts.values())
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
    };
  }, [selectedMonth, enrollments, courses]);
  const cards = [
    {
      title: "Total Enrolled Students",
      value: enrollments.length,
      key: "enrollments",
      icon: Users,
      color: "#C62828",
    },
    {
      title: "Total Courses",
      value: courses.length,
      key: "courses",
      icon: BookOpen,
      color: "#2563eb",
    },
    {
      title: "Total Live Classes",
      value: liveClasses.length,
      key: "classes",
      icon: CalendarDays,
      color: "#7c3aed",
    },
  ] as const;
  return (
    <>
      <div>
        <p className="text-sm text-slate-400">Analytics</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enrollment, course and live-class performance reports.
        </p>
      </div>
      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        {cards.map(({ title, value, key: field, icon: Icon, color }) => (
          <section key={title} className="rounded-2xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{title}</p>
                <b className="mt-2 block text-3xl text-navy">
                  {value.toLocaleString()}
                </b>
              </div>
              <span
                className="grid size-11 place-items-center rounded-xl"
                style={{ background: `${color}15`, color }}
              >
                <Icon className="size-5" />
              </span>
            </div>
            <div className="mt-5 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={movement}>
                  <defs>
                    <linearGradient
                      id={`gradient-${field}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey={field}
                    stroke={color}
                    strokeWidth={2.5}
                    fill={`url(#gradient-${field})`}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        ))}
      </div>
      <section className="mt-5 rounded-2xl border bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-bold text-navy">Monthly Report</h2>
            <p className="mt-1 text-xs text-slate-400">
              Compare enrollments and new courses by month.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold text-navy">
              Month
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent outline-none"
              >
                {months.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex rounded-lg border p-1">
              <button
                onClick={() => setChart("bar")}
                className={`rounded-md px-3 py-1.5 text-xs font-bold ${chart === "bar" ? "bg-navy text-white" : "text-slate-500"}`}
              >
                Bar chart
              </button>
              <button
                onClick={() => setChart("pie")}
                className={`rounded-md px-3 py-1.5 text-xs font-bold ${chart === "pie" ? "bg-navy text-white" : "text-slate-500"}`}
              >
                Pie chart
              </button>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-red/5 p-4">
            <span className="text-xs text-slate-500">Monthly enrollments</span>
            <b className="mt-1 block text-2xl text-navy">
              {selected.enrollments}
            </b>
          </div>
          <div className="rounded-xl bg-blue-50 p-4">
            <span className="text-xs text-slate-500">Courses created</span>
            <b className="mt-1 block text-2xl text-navy">{selected.courses}</b>
          </div>
        </div>
        <div className="mt-6 h-[360px]">
          {chart === "bar" ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={movement}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Legend />
                <Bar
                  dataKey="enrollments"
                  name="Enrollments"
                  fill="#C62828"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="courses"
                  name="Courses"
                  fill="#0A2647"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Enrollments", value: selected.enrollments },
                    { name: "Courses", value: selected.courses },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={4}
                  label
                >
                  {[0, 1].map((i) => (
                    <Cell key={i} fill={colors[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
      <section className="mt-5 rounded-2xl border bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-red/10 text-red">
            <ChartNoAxesCombined className="size-5" />
          </span>
          <div>
            <h2 className="font-bold text-navy">Most Enrolled Courses</h2>
            <p className="text-xs text-slate-400">
              Ranking for {months.find((m) => m.id === selectedMonth)?.label}
            </p>
          </div>
        </div>
        <div className="mt-6 h-[340px]">
          {selected.top.length ? (
            <ResponsiveContainer width="100%" height="100%">
              {chart === "bar" ? (
                <BarChart
                  data={selected.top}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    name="Students"
                    fill="#C62828"
                    radius={[0, 7, 7, 0]}
                  />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={selected.top}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={125}
                    label
                  >
                    {selected.top.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center text-sm text-slate-400">
              No enrollments in this month.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
