"use client";
import {
  BookCopy,
  CalendarDays,
  CalendarRange,
  CircleHelp,
  ClipboardCheck,
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
import { AppShell, type CreateLink, type NavGroup, type NavItem } from "./portal/app-shell";
import { StaffPermissionProvider } from "./staff-permission-context";

type Actions = Record<string, boolean>;
const base = "/dashboard/admin-staff";
const curriculumAction = (path: string) =>
  /^\/dashboard\/admin-staff\/courses\/[^/]+\/curriculum(?:\/|$)/.test(path);
const under = (href: string) => (path: string) =>
  path === href || path.startsWith(`${href}/`);

/** Nav model with the permission modules each entry requires. */
type Gated<T> = T & { modules?: string[] };
type GatedItem = Gated<Omit<NavItem, "children">> & {
  children?: Gated<NonNullable<NavItem["children"]>[number]>[];
};
const groups: { label: string; items: GatedItem[] }[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", icon: LayoutDashboard, href: base, exact: true }],
  },
  {
    label: "Academic",
    items: [
      { label: "Enrollment", icon: LibraryBig, href: `${base}/enrollments`, modules: ["enrollment"] },
      { label: "Intakes", icon: CalendarRange, href: `${base}/intakes`, modules: ["intakes"] },
      { label: "Batches", icon: ListTree, href: `${base}/batches`, modules: ["batches"] },
      { label: "Students", icon: Users, href: `${base}/students`, modules: ["students"] },
      {
        label: "Courses",
        icon: BookCopy,
        children: [
          {
            label: "Course list",
            href: `${base}/courses`,
            modules: ["courses", "curriculum", "curriculum_assignments"],
            isActive: (p) => under(`${base}/courses`)(p) && !curriculumAction(p),
          },
          { label: "Categories", href: `${base}/category`, modules: ["categories"] },
          {
            label: "Curriculum",
            href: `${base}/curriculum`,
            modules: ["curriculum_overview"],
            isActive: (p) => p === `${base}/curriculum` || curriculumAction(p),
          },
          {
            label: "Certificates",
            href: `${base}/certificates`,
            modules: ["certificates", "certificate_students"],
          },
        ],
      },
      { label: "Live classes", icon: Video, href: `${base}/live-classes`, modules: ["live_classes"] },
      {
        label: "Assignments",
        icon: ClipboardCheck,
        href: `${base}/assignments`,
        modules: [
          "assignments",
          "assignment_tab",
          "assignment_students",
          "assignment_student_modules",
          "submitted_assignments",
        ],
      },
    ],
  },
  {
    label: "Classes",
    items: [
      {
        label: "Class management",
        icon: School,
        children: [
          { label: "Attendance", href: `${base}/class/attendance`, modules: ["class_attendance"] },
          { label: "Classes", href: `${base}/class/classes`, modules: ["class_management"] },
          { label: "Reports", href: `${base}/class/reports`, modules: ["class_reports"] },
        ],
      },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Instructors", icon: GraduationCap, href: `${base}/instructors`, modules: ["instructors"] },
      {
        label: "Staff",
        icon: UserCog,
        children: [
          { label: "All staff", href: `${base}/staff`, modules: ["staff"] },
          { label: "Roles & permissions", href: `${base}/roles`, modules: ["roles"] },
        ],
      },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Announcements", icon: Megaphone, href: `${base}/announcements`, modules: ["announcements"] },
      {
        label: "Messages",
        icon: MessageSquareMore,
        href: `${base}/messages`,
        modules: ["messages"],
        badge: "messages",
      },
      { label: "Calendar", icon: CalendarDays, href: `${base}/calendar`, modules: ["calendar"] },
      { label: "Email templates", icon: Mail, href: `${base}/email-templates`, modules: ["email_templates"] },
      {
        label: "Support",
        icon: LifeBuoy,
        children: [
          { label: "Tickets", href: `${base}/support/tickets`, modules: ["tickets"] },
          { label: "Support assistants", href: `${base}/support/assistants`, modules: ["support_assistants"] },
          { label: "FAQ", href: `${base}/support/faq`, modules: ["faq"] },
        ],
      },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Reports", icon: FileBarChart, href: `${base}/reports`, modules: ["reports"] },
      { label: "Private files", icon: FolderLock, href: `${base}/private-files`, modules: ["private_files"] },
      { label: "Help & support", icon: CircleHelp, href: `${base}/support/help`, modules: ["help_support"] },
      {
        label: "Terms & conditions",
        icon: ScrollText,
        href: `${base}/terms-and-conditions`,
        modules: ["terms_conditions"],
      },
      {
        label: "System settings",
        icon: Settings,
        children: [
          { label: "All users", href: `${base}/settings/users`, modules: ["all_users"] },
          { label: "Email configuration", href: `${base}/settings/email`, modules: ["email_configuration"] },
          { label: "Recent activity", href: `${base}/settings/activity`, modules: ["recent_activities"] },
        ],
      },
    ],
  },
];

const createLinks: (CreateLink & { module: string; action: string })[] = [
  { label: "Course", href: `${base}/courses/new`, icon: BookCopy, module: "courses", action: "create" },
  { label: "Category", href: `${base}/category`, icon: Tags, module: "categories", action: "create" },
  { label: "Live class", href: `${base}/live-classes`, icon: Video, module: "live_classes", action: "create" },
  { label: "Student", href: `${base}/students/new`, icon: UserPlus, module: "students", action: "create" },
  { label: "Instructor", href: `${base}/instructors/new`, icon: GraduationCap, module: "instructors", action: "create" },
  { label: "Staff member", href: `${base}/staff/new`, icon: UserCog, module: "staff", action: "create" },
  { label: "Support ticket", href: `${base}/support/tickets/new`, icon: LifeBuoy, module: "tickets", action: "create" },
  { label: "Announcement", href: `${base}/announcements/new`, icon: Megaphone, module: "announcements", action: "create" },
  { label: "FAQ", href: `${base}/support/faq/new`, icon: CircleHelp, module: "faq", action: "create" },
  { label: "Email template", href: `${base}/email-templates/new`, icon: Mail, module: "email_templates", action: "create" },
];

export function StaffPortalShell({
  name,
  roleName,
  permissions,
  children,
}: {
  name: string;
  roleName: string;
  permissions: Record<string, Actions>;
  children: React.ReactNode;
}) {
  const isManager = roleName.trim().toLowerCase() === "manager";
  const hasModule = (modules?: string[]) =>
    !modules ||
    modules.some((key) =>
      key === "recent_activities"
        ? isManager
        : Object.values(permissions[key] || {}).some(Boolean),
    );
  const visible: NavGroup[] = groups
    .map((group) => ({
      label: group.label,
      items: group.items
        .map((item) => {
          const children = item.children?.filter((child) => hasModule(child.modules));
          if (item.children) return children?.length ? { ...item, children } : null;
          return hasModule(item.modules) ? item : null;
        })
        .filter(Boolean) as NavItem[],
    }))
    .filter((group) => group.items.length);
  const shortcuts = createLinks.filter(
    (link) => permissions[link.module]?.full_access || permissions[link.module]?.[link.action],
  );
  return (
    <AppShell
      homeHref={base}
      portalLabel="Staff"
      user={{ name, subtitle: roleName || "Staff", avatar: "/api/account/avatar" }}
      groups={visible}
      createLinks={shortcuts}
      accountLinks={{ profile: `${base}/profile`, password: `${base}/change-password` }}
      wrapContent={(content) => (
        <StaffPermissionProvider permissions={permissions}>{content}</StaffPermissionProvider>
      )}
    >
      {children}
    </AppShell>
  );
}
