"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import {
  Award,
  BookOpen,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  GraduationCap,
  LifeBuoy,
  Radio,
} from "lucide-react";
import {
  AgendaList,
  EmptyState,
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
const base = "/dashboard/student";

export function StudentDashboard({
  name,
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
  const now = useNow();
  const [welcomeOpen, setWelcomeOpen] = useState(showWelcome);
  const closeWelcome = useCallback(() => {
    setWelcomeOpen(false);
    fetch("/api/student/welcome", { method: "POST" }).catch(() => null);
  }, []);
  const upcoming = sessions.filter((s) => new Date(s.start) >= now);

  return (
    <>
      <WelcomeDialog
        open={welcomeOpen}
        icon={GraduationCap}
        title={`Welcome to BGSB, ${name}`}
        cta="Continue to dashboard"
        onClose={closeWelcome}
      >
        <p>
          We are pleased to confirm that your student account for{" "}
          <strong className="text-[#172B4D]">{welcomeCourse}</strong> has been
          successfully created. Your journey with BGSB starts here, and we look
          forward to supporting you throughout your studies.
        </p>
      </WelcomeDialog>

      <PageHeader
        title={<span suppressHydrationWarning>{greetingFor(now)}, {name.split(/\s+/)[0]}</span>}
        description="Pick up where you left off and keep track of what's due."
        actions={
          <>
            <Link href={`${base}/calendar`} className="btn btn-secondary">
              <CalendarDays aria-hidden className="size-4" />
              Calendar
            </Link>
            <Link href={`${base}/courses`} className="btn btn-primary">
              <BookOpen aria-hidden className="size-4" />
              My courses
            </Link>
          </>
        }
      />

      {counts.due > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-[4px] border-l-4 border-[#FFAB00] bg-[#FFFAE6] px-4 py-3">
          <ClipboardList aria-hidden className="size-5 text-[#974F0C]" />
          <p className="min-w-0 flex-1 text-sm text-[#172B4D]">
            You have <b className="font-semibold">{counts.due}</b> assignment
            {counts.due === 1 ? "" : "s"} due soon.
          </p>
          <Link href={`${base}/assignments`} className="btn btn-secondary !min-h-8 bg-white">
            View assignments
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Enrolled courses" value={counts.courses} icon={BookOpen} tone="blue" meta="Active programmes" href={`${base}/courses`} />
        <StatCard label="Assignments due" value={counts.due} icon={ClipboardList} tone={counts.due ? "orange" : "green"} meta={counts.due ? "Submit before the deadline" : "You're all caught up"} href={`${base}/assignments`} />
        <StatCard label="Live meetings" value={counts.meetings} icon={Radio} tone="purple" meta={`${upcoming.length} upcoming`} href={`${base}/meetings`} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="My courses"
          description="Programmes you are enrolled in"
          action={<PanelLink href={`${base}/courses`}>View all</PanelLink>}
        >
          {bestCourses.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {bestCourses.slice(0, 4).map((course, index) => (
                <li key={course.title + index}>
                  <Link
                    href={`${base}/courses`}
                    className="flex h-full items-center gap-3 rounded-[4px] border border-[#DFE1E6] p-3 transition-colors hover:border-[#0052CC] hover:bg-[#F4F5F7]"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-[6px] bg-[#DEEBFF] text-[#0747A6]">
                      <BookOpen aria-hidden className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-sm font-medium text-[#172B4D]">{course.title}</span>
                      <span className="mt-0.5 block text-xs text-[#6B778C]">
                        {course.enrollments} learner{course.enrollments === 1 ? "" : "s"} enrolled
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No enrolled courses yet"
              description="Once your enrollment is approved, your courses will appear here."
            />
          )}
        </Panel>
        <Panel title="Calendar" action={<PanelLink href={`${base}/calendar`}>Open</PanelLink>}>
          <MiniCalendar events={sessions} calendarHref={`${base}/calendar`} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel
          title="Upcoming sessions"
          description="Live classes and appointments"
          action={<PanelLink href={`${base}/meetings`}>Meetings</PanelLink>}
        >
          <AgendaList
            items={upcoming.map((s) => ({
              id: s.id,
              title: s.title,
              start: s.start,
              kind: s.description === "Live class" ? "Live class" : "Appointment",
              meetingUrl: s.meetingUrl,
            }))}
            emptyText="No upcoming sessions"
          />
        </Panel>
        <Panel title="Quick links" description="Everything else you might need">
          <QuickLinks
            links={[
              { label: "Assignments", description: "Submit and track your work", href: `${base}/assignments`, icon: ClipboardList, tone: "blue" },
              { label: "Quizzes", description: "Test your knowledge", href: `${base}/quiz`, icon: CircleHelp, tone: "purple" },
              { label: "Certificates", description: "Download your awards", href: `${base}/certificates`, icon: Award, tone: "green" },
              { label: "Get support", description: "Raise a ticket or read FAQs", href: `${base}/support/help`, icon: LifeBuoy, tone: "orange" },
            ]}
          />
        </Panel>
      </div>
    </>
  );
}
