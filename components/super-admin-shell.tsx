"use client";
import {
  BookCopy,
  CalendarDays,
  CalendarRange,
  CircleHelp,
  ClipboardCheck,
  CreditCard,
  FileBarChart,
  FolderLock,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  LifeBuoy,
  ListTree,
  Mail,
  Megaphone,
  MessageSquareMore,
  School,
  ScrollText,
  Settings,
  Tags,
  UserCog,
  UserPlus,
  Users,
  Video,
} from "lucide-react";
import { AppShell, type CreateLink, type NavGroup } from "./portal/app-shell";
import { GlobalActionConfirmation } from "./global-action-confirmation";

const base = "/dashboard/super-admin";
const curriculumAction = (path: string) =>
  /^\/dashboard\/super-admin\/courses\/[^/]+\/curriculum(?:\/|$)/.test(path);
const under = (href: string) => (path: string) =>
  path === href || path.startsWith(`${href}/`);

const groups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", icon: LayoutDashboard, href: base, exact: true }],
  },
  {
    label: "Academic",
    items: [
      { label: "Enrollment", icon: LibraryBig, href: `${base}/enrollments` },
      { label: "Intakes", icon: CalendarRange, href: `${base}/intakes` },
      { label: "Batches", icon: ListTree, href: `${base}/batches` },
      { label: "Students", icon: Users, href: `${base}/students` },
      {
        label: "Courses",
        icon: BookCopy,
        children: [
          {
            label: "Course list",
            href: `${base}/courses`,
            isActive: (p) => under(`${base}/courses`)(p) && !curriculumAction(p),
          },
          { label: "Categories", href: `${base}/category` },
          {
            label: "Curriculum",
            href: `${base}/curriculum`,
            isActive: (p) => p === `${base}/curriculum` || curriculumAction(p),
          },
          { label: "Certificates", href: `${base}/certificates` },
        ],
      },
      { label: "Live classes", icon: Video, href: `${base}/live-classes` },
      { label: "Assignments", icon: ClipboardCheck, href: `${base}/assignments` },
    ],
  },
  {
    label: "Classes",
    items: [
      {
        label: "Class management",
        icon: School,
        children: [
          { label: "Attendance", href: `${base}/class/attendance` },
          { label: "Classes", href: `${base}/class/classes` },
          { label: "Reports", href: `${base}/class/reports` },
        ],
      },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Instructors", icon: GraduationCap, href: `${base}/instructors` },
      {
        label: "Staff",
        icon: UserCog,
        children: [
          { label: "All staff", href: `${base}/staff` },
          { label: "Roles & permissions", href: `${base}/roles` },
        ],
      },
    ],
  },
  {
    label: "Sales",
    items: [
      {
        label: "Sales",
        icon: CreditCard,
        children: [
          { label: "Payments", href: `${base}/sales/payments` },
          { label: "Invoices", href: `${base}/sales/invoices` },
        ],
      },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Announcements", icon: Megaphone, href: `${base}/announcements` },
      {
        label: "Messages",
        icon: MessageSquareMore,
        href: `${base}/messages`,
        badge: "messages",
      },
      { label: "Calendar", icon: CalendarDays, href: `${base}/calendar` },
      { label: "Email templates", icon: Mail, href: `${base}/email-templates` },
      {
        label: "Support",
        icon: LifeBuoy,
        children: [
          { label: "Tickets", href: `${base}/support/tickets` },
          { label: "Support assistants", href: `${base}/support/assistants` },
          { label: "FAQ", href: `${base}/support/faq` },
        ],
      },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Reports", icon: FileBarChart, href: `${base}/reports` },
      { label: "Private files", icon: FolderLock, href: `${base}/private-files` },
      {
        label: "System settings",
        icon: Settings,
        children: [
          { label: "Email configuration", href: `${base}/settings/email` },
          { label: "All users", href: `${base}/settings/users` },
          { label: "Recent activity", href: `${base}/settings/activity` },
        ],
      },
      { label: "Help & support", icon: CircleHelp, href: `${base}/support/help` },
      {
        label: "Terms & conditions",
        icon: ScrollText,
        href: `${base}/terms-and-conditions`,
      },
    ],
  },
];

const createLinks: CreateLink[] = [
  { label: "Course", href: `${base}/courses/new`, icon: BookCopy },
  { label: "Category", href: `${base}/category`, icon: Tags },
  { label: "Live class", href: `${base}/live-classes`, icon: Video },
  { label: "Student", href: `${base}/students/new`, icon: UserPlus },
  { label: "Instructor", href: `${base}/instructors/new`, icon: GraduationCap },
  { label: "Staff member", href: `${base}/staff/new`, icon: UserCog },
  { label: "Support ticket", href: `${base}/support/tickets/new`, icon: LifeBuoy },
  { label: "Announcement", href: `${base}/announcements/new`, icon: Megaphone },
  { label: "FAQ", href: `${base}/support/faq/new`, icon: CircleHelp },
  { label: "Email template", href: `${base}/email-templates/new`, icon: Mail },
];

export function SuperAdminShell({
  name,
  avatar,
  children,
}: {
  name: string;
  avatar?: string | null;
  children: React.ReactNode;
}) {
  return (
    <AppShell
      homeHref={base}
      portalLabel="Admin"
      user={{ name, subtitle: "Super Admin", avatar: avatar ?? "/api/account/avatar" }}
      groups={groups}
      createLinks={createLinks}
      accountLinks={{ profile: `${base}/profile`, password: `${base}/change-password` }}
    >
      <GlobalActionConfirmation />
      {children}
    </AppShell>
  );
}
