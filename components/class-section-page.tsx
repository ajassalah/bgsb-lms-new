import {
  BarChart3,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  School,
  Users,
} from "lucide-react";

const sections = {
  dashboard: {
    title: "CLASS Dashboard",
    description: "Overview of classes, attendance, students, and instructors.",
    icon: LayoutDashboard,
  },
  attendance: {
    title: "Attendance",
    description: "View and manage class attendance records.",
    icon: ClipboardCheck,
  },
  students: {
    title: "Students",
    description: "View students connected to classes.",
    icon: Users,
  },
  instructors: {
    title: "Instructors",
    description: "View instructors assigned to classes.",
    icon: GraduationCap,
  },
  classes: {
    title: "Class",
    description: "Create and manage class information.",
    icon: School,
  },
  reports: {
    title: "CLASS Reports",
    description: "Review class and attendance reporting.",
    icon: BarChart3,
  },
} as const;

export type ClassSection = keyof typeof sections;

export function ClassSectionPage({ section }: { section: ClassSection }) {
  const value = sections[section],
    Icon = value.icon;
  return (
    <>
      <div>
        <p className="text-sm text-slate-400">CLASS</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">{value.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{value.description}</p>
      </div>
      <section className="mt-7 rounded-2xl border bg-white p-8">
        <span className="grid size-14 place-items-center rounded-2xl bg-red/10 text-red">
          <Icon className="size-7" />
        </span>
        <h2 className="mt-5 text-xl font-bold text-navy">{value.title}</h2>
        <p className="mt-2 text-sm text-slate-500">
          This CLASS workspace is ready for its records and controls.
        </p>
      </section>
    </>
  );
}
