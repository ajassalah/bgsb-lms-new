"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  BookCopy,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  FileBarChart,
  FolderLock,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  ListTree,
  LifeBuoy,
  Menu,
  MessageSquareMore,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  Video,
  X,
} from "lucide-react";
import { StaffTopbar } from "./staff-topbar";
import { StaffPermissionProvider } from "./staff-permission-context";
type Actions = Record<string, boolean>;
type MenuItem = {
  label: string;
  icon: typeof LayoutDashboard;
  href?: string;
  modules?: string[];
  children?: {
    label: string;
    href: string;
    modules: string[];
    icon?: typeof LayoutDashboard;
  }[];
};
const groups: { label: string; items: MenuItem[] }[] = [
  {
    label: "Main",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard/admin-staff",
      },
    ],
  },
  {
    label: "Academic",
    items: [
      {
        label: "Enrollment",
        icon: LibraryBig,
        href: "/dashboard/admin-staff/enrollments",
        modules: ["enrollment"],
      },
      {
        label: "Manage Student",
        icon: Users,
        href: "/dashboard/admin-staff/students",
        modules: ["students"],
      },
      {
        label: "Courses",
        icon: BookCopy,
        modules: [
          "courses",
          "curriculum",
          "curriculum_overview",
          "curriculum_assignments",
          "categories",
          "certificates",
          "certificate_students",
        ],
        children: [
          {
            label: "Course List",
            icon: BookCopy,
            href: "/dashboard/admin-staff/courses",
            modules: ["courses", "curriculum", "curriculum_assignments"],
          },
          {
            label: "Category",
            icon: ShieldCheck,
            href: "/dashboard/admin-staff/category",
            modules: ["categories"],
          },
          {
            label: "Curriculum",
            icon: ListTree,
            href: "/dashboard/admin-staff/curriculum",
            modules: ["curriculum_overview"],
          },
          {
            label: "Certificates",
            icon: ShieldCheck,
            href: "/dashboard/admin-staff/certificates",
            modules: ["certificates", "certificate_students"],
          },
        ],
      },
      {
        label: "Live Classes",
        icon: Video,
        href: "/dashboard/admin-staff/live-classes",
        modules: ["live_classes"],
      },
      {
        label: "Assignments",
        icon: ClipboardCheck,
        href: "/dashboard/admin-staff/assignments",
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
    label: "People",
    items: [
      {
        label: "Instructors",
        icon: GraduationCap,
        href: "/dashboard/admin-staff/instructors",
        modules: ["instructors"],
      },
      {
        label: "Staff",
        icon: UserCog,
        modules: ["staff", "roles"],
        children: [
          {
            label: "All Staff",
            icon: UserCog,
            href: "/dashboard/admin-staff/staff",
            modules: ["staff"],
          },
          {
            label: "Roles & Permissions",
            icon: ShieldCheck,
            href: "/dashboard/admin-staff/roles",
            modules: ["roles"],
          },
        ],
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        label: "Announcements",
        icon: Bell,
        href: "/dashboard/admin-staff/announcements",
        modules: ["announcements"],
      },
      {
        label: "Messages",
        icon: MessageSquareMore,
        href: "/dashboard/admin-staff/messages",
        modules: ["messages"],
      },
      {
        label: "Calendar",
        icon: CalendarDays,
        href: "/dashboard/admin-staff/calendar",
        modules: ["calendar"],
      },
      {
        label: "Email Templates",
        icon: MessageSquareMore,
        href: "/dashboard/admin-staff/email-templates",
        modules: ["email_templates"],
      },
      {
        label: "Support",
        icon: LifeBuoy,
        modules: ["tickets", "faq"],
        children: [
          {
            label: "Tickets",
            href: "/dashboard/admin-staff/support/tickets",
            modules: ["tickets"],
          },
          {
            label: "FAQ",
            href: "/dashboard/admin-staff/support/faq",
            modules: ["faq"],
          },
        ],
      },
    ],
  },
  {
    label: "Platform",
    items: [
      {
        label: "Reports",
        icon: FileBarChart,
        href: "/dashboard/admin-staff/reports",
        modules: ["reports"],
      },
      {
        label: "Private File",
        icon: FolderLock,
        href: "/dashboard/admin-staff/private-files",
        modules: ["private_files"],
      },
      {
        label: "System Settings",
        icon: Settings,
        modules: ["email_configuration", "recent_activities", "all_users"],
        children: [
          {
            label: "All Users",
            href: "/dashboard/admin-staff/settings/users",
            modules: ["all_users"],
          },
          {
            label: "Email Configuration",
            href: "/dashboard/admin-staff/settings/email",
            modules: ["email_configuration"],
          },
          {
            label: "Recent Activities",
            href: "/dashboard/admin-staff/settings/activity",
            modules: ["recent_activities"],
          },
        ],
      },
    ],
  },
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
  const path = usePathname() || "",
    [mobile, setMobile] = useState(false),
    [expanded, setExpanded] = useState(true),
    [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const hasModule = (modules?: string[]) =>
    !modules ||
    modules.some((key) => Object.values(permissions[key] || {}).some(Boolean));
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasModule(item.modules)),
    }))
    .filter((group) => group.items.length);
  return (
    <div
      data-admin-shell
      className={`min-h-screen bg-slate-50 ${expanded ? "lg:pl-[278px]" : "lg:pl-[84px]"}`}
    >
      <aside
        className={`${mobile ? "flex" : "hidden"} fixed inset-y-0 left-0 z-50 w-[278px] flex-col bg-[#111827] text-white lg:flex ${expanded ? "lg:w-[278px]" : "lg:w-[84px]"}`}
      >
        <div className="flex h-[78px] items-center gap-2 border-b border-white/10 p-3">
          <Link
            href="/dashboard/admin-staff"
            className="flex h-14 flex-1 items-center justify-center overflow-hidden rounded-xl bg-white p-2"
          >
            <img
              src={expanded ? "https://bgsb.lk/bgs-logo.png" : "/cropped-.png"}
              className="h-full max-w-full object-contain"
              alt="BGSB"
            />
          </Link>
          <button onClick={() => setMobile(false)} className="lg:hidden">
            <X />
          </button>
        </div>
        <p
          className={`px-6 pt-5 text-xs font-bold uppercase tracking-widest text-white/35 ${expanded ? "" : "lg:hidden"}`}
        >
          {roleName}
        </p>
        <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleGroups.map((group) => (
            <div className="mb-5" key={group.label}>
              <p
                className={`mb-2 px-3 text-xs font-bold uppercase tracking-[.18em] text-white/30 ${expanded ? "" : "lg:hidden"}`}
              >
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const children = item.children?.filter((child) =>
                    hasModule(child.modules),
                  );
                  const active = item.href
                    ? path === item.href || path.startsWith(item.href + "/")
                    : children?.some(
                        (child) =>
                          path === child.href ||
                          path.startsWith(child.href + "/"),
                      );
                  if (children?.length) {
                    const opened = openMenus[item.label] ?? !!active;
                    return (
                      <div key={item.label}>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenus((current) => ({
                              ...current,
                              [item.label]: !opened,
                            }))
                          }
                          title={expanded ? undefined : item.label}
                          className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm ${active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"} ${expanded ? "" : "lg:justify-center lg:px-0"}`}
                        >
                          <Icon className="size-[18px] shrink-0" />
                          <span className={expanded ? "" : "lg:hidden"}>
                            {item.label}
                          </span>
                          <ChevronDown
                            className={`ml-auto size-4 transition ${opened ? "rotate-180" : ""} ${expanded ? "" : "lg:hidden"}`}
                          />
                        </button>
                        {opened && expanded && (
                          <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                            {children.map((child) => {
                              const ChildIcon = child.icon;
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={() => setMobile(false)}
                                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] ${path === child.href || path.startsWith(child.href + "/") ? "bg-red text-white" : "text-white/45 hover:bg-white/5 hover:text-white"}`}
                                >
                                  {ChildIcon ? (
                                    <ChildIcon className="size-3.5 shrink-0" />
                                  ) : null}
                                  {child.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={item.label}
                      href={item.href!}
                      onClick={() => setMobile(false)}
                      title={expanded ? undefined : item.label}
                      className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm ${active ? "bg-red text-white" : "text-white/60 hover:bg-white/5 hover:text-white"} ${expanded ? "" : "lg:justify-center lg:px-0"}`}
                    >
                      <Icon className="size-[18px] shrink-0" />
                      <span className={expanded ? "" : "lg:hidden"}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      {mobile && (
        <button
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobile(false)}
        />
      )}
      <main>
        <StaffTopbar
          name={name}
          roleName={roleName}
          permissions={permissions}
          expanded={expanded}
          openMobile={() => setMobile(true)}
          toggleSidebar={() => setExpanded((x) => !x)}
        />
        <StaffPermissionProvider permissions={permissions}>
          <div className="p-3 sm:p-6 lg:p-8">{children}</div>
        </StaffPermissionProvider>
      </main>
    </div>
  );
}
