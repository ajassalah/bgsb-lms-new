"use client";
import { useCallback, useState } from "react";
import { BookOpen, Building2, GraduationCap, PartyPopper, TrendingUp, Users } from "lucide-react";
import { courses } from "@/lib/demo";
import { roleLabels, type Role } from "@/lib/types";
import {
  Lozenge,
  PageHeader,
  Panel,
  ProgressBar,
  StatCard,
  WelcomeDialog,
  greetingFor,
  useNow,
} from "./portal/ui";

/** Organization / Org Staff overview. Figures are sample data until org reporting is wired up. */
export function DashboardHome({
  role,
  name,
  staffRole,
  showStaffWelcome = false,
}: {
  role: Role;
  name?: string;
  staffRole?: string;
  showStaffWelcome?: boolean;
}) {
  const now = useNow();
  const [welcomeOpen, setWelcomeOpen] = useState(showStaffWelcome);
  const closeWelcome = useCallback(() => {
    setWelcomeOpen(false);
    fetch("/api/staff/welcome", { method: "POST" }).catch(() => null);
  }, []);
  const first = (name || "").split(/\s+/)[0] || "there";

  return (
    <>
      <WelcomeDialog
        open={welcomeOpen}
        icon={PartyPopper}
        title={`Welcome to BGSB LMS, ${name || ""}`}
        cta="Get started"
        onClose={closeWelcome}
      >
        <p>
          Your <strong className="text-[#172B4D]">{staffRole || "Staff"}</strong> account is
          ready. You can now access the LMS features available to your role.
        </p>
      </WelcomeDialog>

      <PageHeader
        title={`${roleLabels[role]} dashboard`}
        description={
          <span suppressHydrationWarning>
            {greetingFor(now)}, {first}. Here&apos;s what&apos;s happening across your learners.
          </span>
        }
        actions={<Lozenge tone="neutral">Sample data</Lozenge>}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Learners" value="1,248" icon={Users} tone="blue" meta="Across your organization" />
        <StatCard label="Courses" value="38" icon={BookOpen} tone="purple" meta="Available to your learners" />
        <StatCard label="Instructors" value="14" icon={GraduationCap} tone="teal" meta="Teaching your cohorts" />
        <StatCard label="Completion rate" value="86%" icon={TrendingUp} tone="green" meta="Average across programmes" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Programme progress"
          description="Average learner progress per course"
          bodyClassName="px-0 pb-2 pt-3"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="px-5 py-2">Course</th>
                  <th className="px-5 py-2">Level</th>
                  <th className="hidden px-5 py-2 sm:table-cell">Duration</th>
                  <th className="w-56 px-5 py-2">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#091E4224]">
                {courses.map((course) => (
                  <tr key={course.slug}>
                    <td className="px-5 py-3">
                      <b className="block font-medium text-[#172B4D]">{course.title}</b>
                      <span className="text-xs text-[#6B778C]">{course.school}</span>
                    </td>
                    <td className="px-5 py-3">
                      <Lozenge tone={course.level === "Advanced" ? "purple" : "blue"}>{course.level}</Lozenge>
                    </td>
                    <td className="hidden px-5 py-3 text-[#42526E] sm:table-cell">{course.weeks} weeks</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <ProgressBar value={course.progress} tone={course.progress >= 60 ? "green" : "blue"} />
                        <span className="w-9 shrink-0 text-right text-xs font-semibold text-[#172B4D]">
                          {course.progress}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Organization" description="Account summary">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-[6px] bg-[#FFF4E5] text-[#974F0C]">
              <Building2 aria-hidden className="size-5" />
            </span>
            <span>
              <b className="block text-sm font-semibold text-[#172B4D]">{name}</b>
              <span className="text-xs text-[#6B778C]">{roleLabels[role]}</span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#42526E]">
            Detailed organization reporting is coming soon. Contact BGSB support
            to enrol learners or request reports for your cohorts.
          </p>
        </Panel>
      </div>
    </>
  );
}
