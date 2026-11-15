"use client";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  LibraryBig,
  PartyPopper,
  Plus,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AgendaList,
  CourseRanking,
  EmptyState,
  MiniCalendar,
  PageHeader,
  Panel,
  PanelLink,
  StatCard,
  WelcomeDialog,
  greetingFor,
  toneHex,
  useNow,
  type Tone,
} from "./portal/ui";
import { Avatar } from "./portal/app-shell";

type Counts = {
  students: number;
  instructors: number;
  courses: number;
  organizations: number;
  enrollments: number;
  completed: number;
};

const COLOMBO = "Asia/Colombo";
const tooltipStyle = {
  borderRadius: 3,
  border: "none",
  boxShadow: "0 8px 12px rgba(9,30,66,.15), 0 0 1px rgba(9,30,66,.31)",
  fontSize: 12,
  padding: "6px 8px",
};

/** Count of ISO dates per month for the last `months` months (oldest first). */
function monthlySeries(dates: string[], months = 6) {
  const now = new Date();
  return Array.from({ length: months }, (_, index) => {
    const from = new Date(now.getFullYear(), now.getMonth() - (months - 1 - index), 1);
    const to = new Date(from.getFullYear(), from.getMonth() + 1, 1);
    return {
      label: from.toLocaleDateString("en-GB", { month: "short" }),
      value: dates.filter((d) => {
        const at = new Date(d);
        return at >= from && at < to;
      }).length,
    };
  });
}

function Sparkline({ data, tone }: { data: { label: string; value: number }[]; tone: Tone }) {
  const color = toneHex[tone];
  return (
    <div className="mt-3 h-10" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${tone}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip contentStyle={tooltipStyle} labelFormatter={(_, p) => p?.[0]?.payload?.label} />
          <Area
            type="monotone"
            dataKey="value"
            name="New"
            stroke={color}
            strokeWidth={2}
            fill={`url(#spark-${tone})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

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
  dashboardTitle = "Admin dashboard",
  showRecentActivity = true,
  manpowerLabels = { users: "Users", admins: "Total admin" },
  enrollmentActivity = [],
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
  recentActivity: { id: string; name: string; avatar: string | null; event: string; date: string }[];
  upcomingSessions: { id: string; title: string; start: string; meetingUrl: string | null }[];
  staffWelcome?: { show: boolean; role: string };
  basePath?: string;
  dashboardTitle?: string;
  showRecentActivity?: boolean;
  manpowerLabels?: { users: string; admins: string };
  enrollmentActivity?: string[];
}) {
  const now = useNow();
  const [welcomeOpen, setWelcomeOpen] = useState(!!staffWelcome?.show);
  const closeWelcome = useCallback(() => {
    setWelcomeOpen(false);
    fetch("/api/staff/welcome", { method: "POST" }).catch(() => null);
  }, []);
  const isSuperAdmin = basePath === "/dashboard/super-admin";
  const firstName = admin.name.trim().split(/\s+/)[0] || "there";

  const thisMonth = (dates: string[]) => {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return dates.filter((d) => new Date(d) >= start).length;
  };
  const series = useMemo(
    () => ({
      students: monthlySeries(movement.students),
      instructors: monthlySeries(movement.instructors),
      courses: monthlySeries(movement.courses),
      enrollments: monthlySeries(enrollmentActivity),
    }),
    [movement, enrollmentActivity],
  );

  const daily = useMemo(
    () =>
      Array.from({ length: 14 }, (_, offset) => {
        const day = new Date(now);
        day.setHours(0, 0, 0, 0);
        day.setDate(day.getDate() - (13 - offset));
        const next = new Date(day);
        next.setDate(next.getDate() + 1);
        return {
          label: day.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
          value: enrollmentActivity.filter((d) => {
            const at = new Date(d);
            return at >= day && at < next;
          }).length,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enrollmentActivity, now.toDateString()],
  );
  const dailyTotal = daily.reduce((sum, d) => sum + d.value, 0);

  const completionPct = counts.enrollments
    ? Math.round((counts.completed / counts.enrollments) * 100)
    : 0;
  const inProgress = Math.max(0, counts.enrollments - counts.completed);

  const agenda = appointments
    .filter((item) => new Date(item.start) >= now)
    .sort((a, b) => +new Date(a.start) - +new Date(b.start))
    .map((item) => ({
      id: item.id,
      title: item.title,
      start: item.start,
      kind: item.status === "appointment" ? "Appointment" : "Live class",
      meetingUrl: item.meetingUrl,
    }));
  const sessionsAgenda = upcomingSessions.map((s) => ({ ...s, kind: "Live class" }));

  const dateLine = new Intl.DateTimeFormat("en-GB", {
    timeZone: COLOMBO,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <>
      <WelcomeDialog
        open={welcomeOpen}
        icon={PartyPopper}
        title={`Welcome to BGSB LMS, ${admin.name}`}
        cta="Get started"
        onClose={closeWelcome}
      >
        <p>
          Your <strong className="text-[#172B4D]">{staffWelcome?.role || "Staff"}</strong>{" "}
          account is ready. You can now use the LMS tools available to your role.
        </p>
        <p>Take a moment to explore your dashboard and get familiar with your workspace. We&apos;re glad to have you on the team.</p>
      </WelcomeDialog>

      <PageHeader
        title={dashboardTitle}
        description={
          <span suppressHydrationWarning>
            {greetingFor(now)}, {firstName}. {dateLine}
          </span>
        }
        actions={
          <>
            <Link href={`${basePath}/calendar`} className="btn btn-secondary">
              <CalendarDays aria-hidden className="size-4" />
              Calendar
            </Link>
            {isSuperAdmin && (
              <>
                <Link href={`${basePath}/reports`} className="btn btn-secondary">
                  <BarChart3 aria-hidden className="size-4" />
                  Reports
                </Link>
                <Link href={`${basePath}/students/new`} className="btn btn-primary">
                  <Plus aria-hidden className="size-4" />
                  Add student
                </Link>
              </>
            )}
          </>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Students"
          value={counts.students.toLocaleString()}
          icon={Users}
          tone="blue"
          meta={`${thisMonth(movement.students)} joined this month`}
          href={`${basePath}/students`}
        >
          <Sparkline data={series.students} tone="blue" />
        </StatCard>
        <StatCard
          label="Instructors"
          value={counts.instructors.toLocaleString()}
          icon={GraduationCap}
          tone="purple"
          meta={`${thisMonth(movement.instructors)} added this month`}
          href={`${basePath}/instructors`}
        >
          <Sparkline data={series.instructors} tone="purple" />
        </StatCard>
        <StatCard
          label="Published courses"
          value={counts.courses.toLocaleString()}
          icon={BookOpen}
          tone="teal"
          meta={`${thisMonth(movement.courses)} published this month`}
          href={`${basePath}/courses`}
        >
          <Sparkline data={series.courses} tone="teal" />
        </StatCard>
        <StatCard
          label="Enrollments"
          value={counts.enrollments.toLocaleString()}
          icon={LibraryBig}
          tone="green"
          meta={`${counts.completed.toLocaleString()} completed · ${completionPct}% completion`}
          href={`${basePath}/enrollments`}
        >
          <Sparkline data={series.enrollments} tone="green" />
        </StatCard>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Enrollment activity"
          description={`New enrollments over the last 14 days · ${dailyTotal} total`}
          action={<PanelLink href={`${basePath}/enrollments`}>View enrollments</PanelLink>}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily} margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
                <CartesianGrid vertical={false} stroke="#091E4224" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#6B778C" }}
                  interval="preserveStartEnd"
                  minTickGap={16}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#6B778C" }}
                />
                <Tooltip
                  cursor={{ fill: "#091E420F" }}
                  contentStyle={tooltipStyle}
                  formatter={(value) => [value, "Enrollments"]}
                />
                <Bar dataKey="value" fill="#0065FF" radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {dailyTotal === 0 && (
            <p className="mt-2 text-center text-xs text-[#6B778C]">
              No enrollments in the last 14 days.
            </p>
          )}
        </Panel>

        <Panel
          title="Calendar"
          description="Classes and appointments"
          action={<PanelLink href={`${basePath}/calendar`}>Open</PanelLink>}
        >
          <MiniCalendar events={appointments} calendarHref={`${basePath}/calendar`} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Panel
          title="Top courses"
          description="By number of enrolled students"
          action={<PanelLink href={`${basePath}/courses`}>All courses</PanelLink>}
        >
          <CourseRanking
            courses={bestCourses}
            emptyTitle="No enrollment data yet"
            emptyDescription="Courses will be ranked here once students enroll."
          />
        </Panel>

        <Panel title="Course completion" description="Completed vs. in-progress enrollments">
          <div className="flex items-center gap-5">
            <div className="relative size-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Completed", value: counts.completed },
                      { name: "In progress", value: inProgress || (counts.completed ? 0 : 1) },
                    ]}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={68}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    <Cell fill="#36B37E" />
                    <Cell fill="#DFE1E6" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center text-center">
                <span>
                  <b className="block text-2xl font-semibold text-[#172B4D]">{completionPct}%</b>
                  <span className="text-[11px] text-[#6B778C]">completed</span>
                </span>
              </div>
            </div>
            <dl className="min-w-0 flex-1 space-y-3 text-sm">
              {[
                ["Completed", counts.completed, "#36B37E"],
                ["In progress", inProgress, "#97A0AF"],
                ["Total enrollments", counts.enrollments, "#0065FF"],
              ].map(([label, value, color]) => (
                <div key={label as string} className="flex items-center justify-between gap-2">
                  <dt className="flex items-center gap-2 text-[#42526E]">
                    <span className="size-2 rounded-full" style={{ background: color as string }} />
                    {label}
                  </dt>
                  <dd className="font-semibold text-[#172B4D]">{(value as number).toLocaleString()}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Panel>

        <Panel title="People" description="Current platform totals">
          <ul className="space-y-2">
            {(
              [
                [manpowerLabels.users, manpower.users, Users, "blue", `${basePath}/students`],
                [manpowerLabels.admins, manpower.admins, UserCog, "purple", `${basePath}/staff`],
                ["Instructors", counts.instructors, GraduationCap, "teal", `${basePath}/instructors`],
                ["Organizations", counts.organizations, Building2, "orange", null],
              ] as const
            ).map(([label, value, Icon, tone, href]) => {
              const row = (
                <>
                  <span
                    className={`grid size-8 place-items-center rounded-[6px] ${
                      {
                        blue: "bg-[#DEEBFF] text-[#0747A6]",
                        purple: "bg-[#EAE6FF] text-[#403294]",
                        teal: "bg-[#E6FCFF] text-[#00849B]",
                        orange: "bg-[#FFF4E5] text-[#974F0C]",
                      }[tone]
                    }`}
                  >
                    <Icon aria-hidden className="size-4" />
                  </span>
                  <span className="flex-1 text-sm text-[#42526E]">{label}</span>
                  <b className="text-sm font-semibold text-[#172B4D]">{value.toLocaleString()}</b>
                </>
              );
              return (
                <li key={label}>
                  {href ? (
                    <Link
                      href={href}
                      className="flex items-center gap-3 rounded-[4px] p-2 hover:bg-[#091E420F]"
                    >
                      {row}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 p-2">{row}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className={`mt-4 grid gap-4 ${showRecentActivity ? "lg:grid-cols-2" : ""}`}>
        <Panel
          title="Upcoming schedule"
          description="Next live classes and appointments"
          action={<PanelLink href={`${basePath}/live-classes`}>Live classes</PanelLink>}
        >
          <AgendaList items={agenda.length ? agenda : sessionsAgenda} emptyText="Nothing scheduled yet" />
        </Panel>
        {showRecentActivity && (
          <Panel
            title="Recent activity"
            description="Latest sign-ins and platform events"
            action={<PanelLink href={`${basePath}/settings/activity`}>View all</PanelLink>}
          >
            {recentActivity.length ? (
              <ul className="divide-y divide-[#091E4224]">
                {recentActivity.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-1">
                    <Avatar name={item.name} src={item.avatar} size={32} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#172B4D]">
                        {item.name}
                      </span>
                      <span className="block truncate text-xs text-[#6B778C]">{item.event}</span>
                    </span>
                    <time className="shrink-0 text-xs text-[#6B778C]" dateTime={item.date}>
                      {new Date(item.date).toLocaleString("en-GB", {
                        timeZone: COLOMBO,
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={Activity}
                title="No recent activity"
                description="Sign-ins and changes made by your team will appear here."
              />
            )}
          </Panel>
        )}
      </div>

      {isSuperAdmin && (
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[#6B778C]">
          <ShieldCheck aria-hidden className="size-3.5" />
          You are signed in with full administrator access.
        </p>
      )}
    </>
  );
}
