"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import {
  Award,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  ListTree,
  Megaphone,
  Plus,
  Radio,
  Users,
} from "lucide-react";
import {
  AgendaList,
  CourseRanking,
  MiniCalendar,
  PageHeader,
  Panel,
  PanelLink,
  QuickLinks,
  StatCard,
  WelcomeDialog,
  greetingFor,
  useNow,
} from "./portal/ui";

type Session = {
  id: string;
  title: string;
  description: string;
  start: string;
  meetingUrl: string | null;
};
const base = "/dashboard/instructor";

export function InstructorDashboard({
  name,
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
  const now = useNow();
  const [welcomeOpen, setWelcomeOpen] = useState(showWelcome);
  const closeWelcome = useCallback(() => {
    setWelcomeOpen(false);
    fetch("/api/instructor/welcome", { method: "POST" }).catch(() => null);
  }, []);
  const upcoming = sessions
    .filter((s) => new Date(s.start) >= now)
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));
  const nextClass = upcoming.find((s) => s.description === "Live class");

  return (
    <>
      <WelcomeDialog
        open={welcomeOpen}
        icon={GraduationCap}
        title={`Welcome, ${name}`}
        cta="Get started"
        onClose={closeWelcome}
      >
        <p>
          Your instructor dashboard is ready. Here you can manage your courses,
          learning materials, assignments, students and academic activities.
        </p>
        <p>
          We&apos;re happy to have you as part of the{" "}
          <strong className="text-[#172B4D]">BGSB academic team</strong>.
        </p>
      </WelcomeDialog>

      <PageHeader
        title="Instructor dashboard"
        description={
          <span suppressHydrationWarning>
            {greetingFor(now)}, {name.split(/\s+/)[0]}. Here&apos;s your teaching overview.
          </span>
        }
        actions={
          <>
            <Link href={`${base}/calendar`} className="btn btn-secondary">
              <CalendarDays aria-hidden className="size-4" />
              Calendar
            </Link>
            <Link href={`${base}/live-classes`} className="btn btn-primary">
              <Plus aria-hidden className="size-4" />
              Schedule live class
            </Link>
          </>
        }
      />

      {nextClass && (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-[4px] border-l-4 border-[#0052CC] bg-[#DEEBFF] px-4 py-3">
          <Radio aria-hidden className="size-5 text-[#0747A6]" />
          <p className="min-w-0 flex-1 text-sm text-[#172B4D]">
            <b className="font-semibold">Next live class:</b> {nextClass.title} ·{" "}
            {new Date(nextClass.start).toLocaleString("en-GB", {
              timeZone: "Asia/Colombo",
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          {nextClass.meetingUrl && (
            <a href={nextClass.meetingUrl} target="_blank" rel="noreferrer" className="btn btn-primary !min-h-8">
              Start class
            </a>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="My students" value={counts.students} icon={Users} tone="blue" meta="Across your assigned courses" href={`${base}/my-students`} />
        <StatCard label="Assigned courses" value={counts.assignedCourses} icon={BookOpen} tone="purple" meta="Courses you teach" href={`${base}/my-courses`} />
        <StatCard label="Published courses" value={counts.publishedCourses} icon={Award} tone="teal" meta="Live in the catalogue" />
        <StatCard label="Live sessions" value={counts.liveSessions} icon={Radio} tone="green" meta={`${upcoming.length} upcoming`} href={`${base}/live-classes`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Upcoming sessions"
          description="Your live classes and appointments"
          action={<PanelLink href={`${base}/live-classes`}>All sessions</PanelLink>}
        >
          <AgendaList
            items={upcoming.map((s) => ({
              id: s.id,
              title: s.title,
              start: s.start,
              kind: s.description === "Live class" ? "Live class" : "Appointment",
              meetingUrl: s.meetingUrl,
            }))}
            limit={6}
            emptyText="No upcoming sessions"
          />
        </Panel>
        <Panel title="Calendar" action={<PanelLink href={`${base}/calendar`}>Open</PanelLink>}>
          <MiniCalendar events={sessions} calendarHref={`${base}/calendar`} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel
          title="My top courses"
          description="Assigned courses by enrolled students"
          action={<PanelLink href={`${base}/my-courses`}>My courses</PanelLink>}
        >
          <CourseRanking
            courses={bestCourses}
            emptyTitle="No assigned courses yet"
            emptyDescription="Courses assigned to you by an administrator will appear here."
            unit="students"
          />
        </Panel>
        <Panel title="Quick actions" description="Jump straight into common tasks">
          <QuickLinks
            links={[
              { label: "Create assignment", description: "Set work for a course module", href: `${base}/assignments`, icon: ClipboardList, tone: "blue" },
              { label: "Curriculum", description: "Organise modules and lessons", href: `${base}/curriculum`, icon: ListTree, tone: "purple" },
              { label: "Post announcement", description: "Notify your students", href: `${base}/announcements`, icon: Megaphone, tone: "orange" },
              { label: "My students", description: "Progress and submissions", href: `${base}/my-students`, icon: Users, tone: "green" },
            ]}
          />
        </Panel>
      </div>
    </>
  );
}
