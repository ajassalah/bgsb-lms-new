"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  Activity,
  Bell,
  BookCopy,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  CircleHelp,
  CreditCard,
  ClipboardCheck,
  FileBarChart,
  FolderLock,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  ListTree,
  Menu,
  Moon,
  MessageSquareMore,
  LifeBuoy,
  PanelLeftClose,
  PanelLeftOpen,
  KeyRound,
  PlusCircle,
  Settings,
  Sun,
  ShieldCheck,
  Tags,
  UserCog,
  UserRound,
  School,
  ScrollText,
  Users,
  Video,
  X,
} from "lucide-react";
import { SignOut } from "./signout";
import { GlobalActionConfirmation } from "./global-action-confirmation";
import { TopbarProfileAvatar } from "./topbar-profile-avatar";

const groups = [
  {
    label: "Main",
    items: [["Dashboard", LayoutDashboard, "/dashboard/super-admin"]],
  },
  {
    label: "Academic",
    items: [
      ["Enrollment", LibraryBig, "/dashboard/super-admin/enrollments"],
      ["Intake", CalendarRange, "/dashboard/super-admin/intakes"],
      ["Batch", ListTree, "/dashboard/super-admin/batches"],
      ["Manage Student", Users, "/dashboard/super-admin/students"],
      ["Courses", BookCopy, "/dashboard/super-admin/courses"],
      ["Live classes", Video, "/dashboard/super-admin/live-classes"],
      ["Assignments", ClipboardCheck, "/dashboard/super-admin/assignments"],
    ],
  },
  {
    label: "CLASS",
    items: [
      ["Dashboard", LayoutDashboard, "/dashboard/super-admin/class"],
      ["Attendance", ClipboardCheck, "/dashboard/super-admin/class/attendance"],
      ["Students", Users, "/dashboard/super-admin/class/students"],
      [
        "Instructors",
        GraduationCap,
        "/dashboard/super-admin/class/instructors",
      ],
      ["Class", School, "/dashboard/super-admin/class/classes"],
      ["Reports", FileBarChart, "/dashboard/super-admin/class/reports"],
    ],
  },
  {
    label: "People",
    items: [
      ["Instructors", GraduationCap, "/dashboard/super-admin/instructors"],
      ["Staff", UserCog, "/dashboard/super-admin/staff"],
    ],
  },
  { label: "Sales", items: [["Sales", CreditCard, "#"]] },
  {
    label: "Communication",
    items: [
      ["Announcements", Bell, "/dashboard/super-admin/announcements"],
      ["Messages", MessageSquareMore, "/dashboard/super-admin/messages"],
      ["Calendar", CalendarDays, "/dashboard/super-admin/calendar"],
      [
        "Email Templates",
        MessageSquareMore,
        "/dashboard/super-admin/email-templates",
      ],
      ["Support", LifeBuoy, "/dashboard/super-admin/support/tickets"],
    ],
  },
  {
    label: "Platform",
    items: [
      ["Reports", FileBarChart, "/dashboard/super-admin/reports"],
      ["Private File", FolderLock, "/dashboard/super-admin/private-files"],
      ["System settings", Settings, "#"],
      ["Help & Support", CircleHelp, "/dashboard/super-admin/support/help"],
      [
        "Terms & Conditions",
        ScrollText,
        "/dashboard/super-admin/terms-and-conditions",
      ],
    ],
  },
] as const;

export function SuperAdminShell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const courseLinks = [
      ["Course List", "courses", BookCopy],
      ["Category", "category", Tags],
      ["Curriculum", "curriculum", ListTree],
      ["Certificates", "certificates", ShieldCheck],
    ] as const,
    courseActive = courseLinks.some(
      ([, slug]) =>
        pathname === `/dashboard/super-admin/${slug}` ||
        pathname.startsWith(`/dashboard/super-admin/${slug}/`),
    ),
    [sidebar, setSidebar] = useState(true),
    [coursesOpen, setCoursesOpen] = useState(courseActive),
    [classOpen, setClassOpen] = useState(
      pathname.startsWith("/dashboard/super-admin/class"),
    ),
    [mobile, setMobile] = useState(false),
    [shortcutsOpen, setShortcutsOpen] = useState(false),
    [accountOpen, setAccountOpen] = useState(false),
    [notificationsOpen, setNotificationsOpen] = useState(false),
    [darkMode, setDarkMode] = useState(false),
    [themeReady, setThemeReady] = useState(false),
    [unreadMessages, setUnreadMessages] = useState(0),
    [notifications, setNotifications] = useState<
      { id: string; title: string; url: string; date: string }[]
    >([]);
  const [supportOpen, setSupportOpen] = useState(
    pathname.startsWith("/dashboard/super-admin/support"),
  );
  const [staffOpen, setStaffOpen] = useState(
    pathname.startsWith("/dashboard/super-admin/staff") ||
      pathname.startsWith("/dashboard/super-admin/roles"),
  );
  const [systemOpen, setSystemOpen] = useState(
    pathname.startsWith("/dashboard/super-admin/settings"),
  );
  const [salesOpen, setSalesOpen] = useState(
    pathname.startsWith("/dashboard/super-admin/sales"),
  );
  useEffect(() => setMobile(false), [pathname]);
  useEffect(() => {
    if (courseActive) setCoursesOpen(true);
  }, [courseActive]);
  useLayoutEffect(() => {
    const saved = window.localStorage.getItem("bgsb-admin-theme");
    setDarkMode(
      document.documentElement.classList.contains("admin-dark") ||
        (saved
          ? saved === "dark"
          : window.matchMedia("(prefers-color-scheme: dark)").matches),
    );
    setThemeReady(true);
  }, []);
  useEffect(() => {
    if (themeReady) {
      window.localStorage.setItem(
        "bgsb-admin-theme",
        darkMode ? "dark" : "light",
      );
      document.documentElement.classList.toggle("admin-dark", darkMode);
    }
  }, [darkMode, themeReady]);
  useEffect(() => {
    let active = true;
    const refreshNotifications = () =>
      fetch("/api/admin/notifications", { cache: "no-store" })
        .then((x) => x.json())
        .then((x) => {
          if (active) setNotifications(x.items || []);
        })
        .catch(() => {});
    refreshNotifications();
    const timer = window.setInterval(refreshNotifications, 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [pathname]);
  useEffect(() => {
    let active = true;
    const refreshUnread = () =>
      fetch("/api/admin/messages/unread", { cache: "no-store" })
        .then((x) => x.json())
        .then((x) => {
          if (active) setUnreadMessages(x.count || 0);
        })
        .catch(() => {});
    refreshUnread();
    const timer = window.setInterval(refreshUnread, 15000);
    window.addEventListener("messages-read", refreshUnread);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("messages-read", refreshUnread);
    };
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile]);
  function markNotifications(ids: string[]) {
    if (!ids.length) return;
    setNotifications((items) => items.filter((item) => !ids.includes(item.id)));
    fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids }),
      keepalive: true,
    }).catch(() => {});
  }
  return (
    <div
      data-admin-shell
      className={`min-h-screen max-w-full bg-[#f5f6fa] ${darkMode ? "admin-dark" : ""}`}
    >
      <GlobalActionConfirmation />
      {mobile && (
        <button
          aria-label="Close sidebar"
          onClick={() => setMobile(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}
      <aside
        className={`${mobile ? "fixed inset-y-0 left-0 z-50 flex" : "hidden"} h-dvh w-[278px] max-w-[86vw] flex-col overflow-hidden bg-[#111827] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:h-screen lg:max-w-none ${sidebar ? "lg:w-[278px]" : "lg:w-[84px]"}`}
      >
        <div
          className={`flex h-[78px] items-center gap-3 border-b border-white/10 ${sidebar ? "px-4" : "lg:px-3"}`}
        >
          <Link
            href="/dashboard/super-admin"
            className={`flex h-14 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-white ${sidebar ? "px-3 py-2" : "lg:p-1"}`}
          >
            <img
              src={sidebar ? "https://bgsb.lk/bgs-logo.png" : "/cropped-.png"}
              alt="BGSB"
              className="sidebar-logo-light h-full w-full object-contain"
            />
            <img
              src={
                sidebar ? "/BGS Logo White-01.png" : "/BGS Logo White-01.png"
              }
              alt="BGSB"
              className="sidebar-logo-dark h-full w-full object-contain"
            />
          </Link>
          <button
            onClick={() => setMobile(false)}
            aria-label="Close sidebar"
            className="grid size-9 shrink-0 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>
        <div
          className={`admin-sidebar-scroll flex-1 overflow-y-auto py-5 ${sidebar ? "px-4" : "lg:px-2"}`}
        >
          {groups.map((group) => (
            <div className="mb-6" key={group.label}>
              <p
                className={`mb-2 px-3 text-xs font-bold uppercase tracking-[.18em] text-white/30 ${sidebar ? "" : "lg:hidden"}`}
              >
                {group.label}
              </p>
              <nav className="space-y-1">
                {group.items.map(([label, Icon, href]) =>
                  group.label === "CLASS" ? (
                    label === "Dashboard" ? (
                      <div key="class-dashboard">
                        <button
                          type="button"
                          onClick={() => setClassOpen((open) => !open)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${sidebar ? "" : "lg:justify-center lg:px-0"} ${pathname.startsWith("/dashboard/super-admin/class") ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                        >
                          <LayoutDashboard className="size-[18px] shrink-0" />
                          <span className={sidebar ? "" : "lg:hidden"}>
                            Dashboard
                          </span>
                          <ChevronDown
                            className={`ml-auto size-3.5 transition ${classOpen ? "rotate-180" : ""} ${sidebar ? "" : "lg:hidden"}`}
                          />
                        </button>
                        {classOpen && sidebar && (
                          <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                            {(
                              [
                                ["Attendance", "attendance", ClipboardCheck],
                                ["Student", "students", Users],
                                ["Instructor", "instructors", GraduationCap],
                                ["Class", "classes", School],
                                ["Report", "reports", FileBarChart],
                              ] as const
                            ).map(([name, slug, ChildIcon]) => {
                              const url = `/dashboard/super-admin/class/${slug}`;
                              return (
                                <Link
                                  key={slug}
                                  href={url}
                                  onClick={() => setMobile(false)}
                                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition ${pathname === url || pathname.startsWith(`${url}/`) ? "bg-red text-white" : "text-white/45 hover:bg-white/5 hover:text-white"}`}
                                >
                                  <ChildIcon className="size-3.5 shrink-0" />
                                  {name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : null
                  ) : label === "Courses" ? (
                    <div key={label}>
                      <button
                        onClick={() => setCoursesOpen((x) => !x)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${sidebar ? "" : "lg:justify-center lg:px-0"} ${courseActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                      >
                        <Icon className="size-[18px]" />
                        <span className={sidebar ? "" : "lg:hidden"}>
                          Courses
                        </span>
                        <ChevronDown
                          className={`ml-auto size-3.5 transition ${coursesOpen ? "rotate-180" : ""} ${sidebar ? "" : "lg:hidden"}`}
                        />
                      </button>
                      {coursesOpen && sidebar && (
                        <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                          {courseLinks.map(([name, slug, ChildIcon]) => {
                            const url = `/dashboard/super-admin/${slug}`;
                            const curriculumAction =
                              /^\/dashboard\/super-admin\/courses\/[^/]+\/curriculum(?:\/|$)/.test(
                                pathname,
                              );
                            const childActive =
                              slug === "curriculum"
                                ? pathname === url || curriculumAction
                                : slug === "courses"
                                  ? (pathname === url ||
                                      pathname.startsWith(`${url}/`)) &&
                                    !curriculumAction
                                  : pathname === url ||
                                    pathname.startsWith(`${url}/`);
                            return (
                              <Link
                                href={url}
                                onClick={() => setMobile(false)}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition ${childActive ? "bg-red text-white" : "text-white/45 hover:bg-white/5 hover:text-white"}`}
                                key={slug}
                              >
                                <ChildIcon className="size-3.5 shrink-0" />
                                {name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : label === "Staff" ? (
                    <div key={label}>
                      <button
                        onClick={() => setStaffOpen((x) => !x)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${sidebar ? "" : "lg:justify-center lg:px-0"} ${pathname.startsWith("/dashboard/super-admin/staff") || pathname.startsWith("/dashboard/super-admin/roles") ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5"}`}
                      >
                        <Icon className="size-[18px]" />
                        <span className={sidebar ? "" : "lg:hidden"}>
                          Staff
                        </span>
                        <ChevronDown
                          className={`ml-auto size-3.5 ${staffOpen ? "rotate-180" : ""} ${sidebar ? "" : "lg:hidden"}`}
                        />
                      </button>
                      {staffOpen && sidebar && (
                        <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                          <Link
                            href="/dashboard/super-admin/staff"
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] ${pathname === "/dashboard/super-admin/staff" ? "bg-red text-white" : "text-white/45"}`}
                          >
                            <UserCog className="size-3.5 shrink-0" />
                            All Staffs
                          </Link>
                          <Link
                            href="/dashboard/super-admin/roles"
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] ${pathname.startsWith("/dashboard/super-admin/roles") ? "bg-red text-white" : "text-white/45"}`}
                          >
                            <ShieldCheck className="size-3.5 shrink-0" />
                            Roles & Permissions
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : label === "Support" ? (
                    <div key={label}>
                      <button
                        onClick={() => setSupportOpen((open) => !open)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${sidebar ? "" : "lg:justify-center lg:px-0"} ${
                          pathname.startsWith("/dashboard/super-admin/support")
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon className="size-[18px]" />
                        <span className={sidebar ? "" : "lg:hidden"}>
                          Support
                        </span>
                        <ChevronDown
                          className={`ml-auto size-3.5 transition ${supportOpen ? "rotate-180" : ""} ${sidebar ? "" : "lg:hidden"}`}
                        />
                      </button>
                      {supportOpen && sidebar && (
                        <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                          {[
                            ["Ticket", "tickets"],
                            ["FAQ", "faq"],
                          ].map(([name, slug]) => {
                            const url = `/dashboard/super-admin/support/${slug}`;
                            return (
                              <Link
                                href={url}
                                onClick={() => setMobile(false)}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition ${
                                  pathname === url ||
                                  pathname.startsWith(`${url}/`)
                                    ? "bg-red text-white"
                                    : "text-white/45 hover:bg-white/5 hover:text-white"
                                }`}
                                key={slug}
                              >
                                <LifeBuoy className="size-3.5" />
                                {name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : label === "Sales" ? (
                    <div key={label}>
                      <button
                        onClick={() => setSalesOpen((x) => !x)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${pathname.startsWith("/dashboard/super-admin/sales") ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5"}`}
                      >
                        <Icon className="size-[18px]" />
                        <span className={sidebar ? "" : "lg:hidden"}>
                          Sales
                        </span>
                        <ChevronDown
                          className={`ml-auto size-3.5 ${salesOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {salesOpen && sidebar && (
                        <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                          {(
                            [
                              ["Payment", "payments", CreditCard],
                              ["Invoice", "invoices", ClipboardCheck],
                            ] as const
                          ).map(([name, slug, ChildIcon]) => (
                            <Link
                              key={slug}
                              href={`/dashboard/super-admin/sales/${slug}`}
                              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] ${pathname.endsWith(String(slug)) ? "bg-red text-white" : "text-white/45"}`}
                            >
                              <ChildIcon className="size-3.5 shrink-0" />
                              {name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : label === "System settings" ? (
                    <div key={label}>
                      <button
                        onClick={() => setSystemOpen((open) => !open)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${sidebar ? "" : "lg:justify-center lg:px-0"} ${pathname.startsWith("/dashboard/super-admin/settings") ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                      >
                        <Icon className="size-[18px]" />
                        <span className={sidebar ? "" : "lg:hidden"}>
                          System settings
                        </span>
                        <ChevronDown
                          className={`ml-auto size-3.5 transition ${systemOpen ? "rotate-180" : ""} ${sidebar ? "" : "lg:hidden"}`}
                        />
                      </button>
                      {systemOpen && sidebar && (
                        <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                          <Link
                            href="/dashboard/super-admin/settings/email"
                            onClick={() => setMobile(false)}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition ${pathname === "/dashboard/super-admin/settings/email" ? "bg-red text-white" : "text-white/45 hover:bg-white/5 hover:text-white"}`}
                          >
                            <Settings className="size-3.5" />
                            Email Configuration
                          </Link>
                          <Link
                            href="/dashboard/super-admin/settings/users"
                            onClick={() => setMobile(false)}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] ${pathname === "/dashboard/super-admin/settings/users" ? "bg-red text-white" : "text-white/45 hover:bg-white/5"}`}
                          >
                            <Users className="size-3.5" />
                            All Users
                          </Link>
                          <Link
                            href="/dashboard/super-admin/settings/activity"
                            onClick={() => setMobile(false)}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] ${pathname === "/dashboard/super-admin/settings/activity" ? "bg-red text-white" : "text-white/45 hover:bg-white/5"}`}
                          >
                            <Activity className="size-3.5" />
                            Recent Activity
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={href}
                      onClick={() => setMobile(false)}
                      key={label}
                      className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${sidebar ? "" : "lg:justify-center lg:px-0"} ${pathname === href ? "bg-red font-semibold text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                    >
                      <Icon className="size-[18px]" />
                      <span className={sidebar ? "" : "lg:hidden"}>
                        {label}
                      </span>
                      {label === "Messages" && unreadMessages > 0 && (
                        <span
                          className={`${sidebar ? "ml-auto" : "absolute right-1 top-1"} grid min-w-5 place-items-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-bold leading-4 text-white`}
                        >
                          {unreadMessages > 99 ? "99+" : unreadMessages}
                        </span>
                      )}
                      {["Organizations"].includes(label) && (
                        <ChevronDown className="ml-auto size-3.5 opacity-40" />
                      )}
                    </Link>
                  ),
                )}
              </nav>
            </div>
          ))}
        </div>
      </aside>
      <div
        className={`min-w-0 max-w-full overflow-x-hidden transition-[margin] ${sidebar ? "lg:ml-[278px]" : "lg:ml-[84px]"}`}
      >
        <header className="sticky top-0 z-30 flex h-[70px] items-center gap-2 border-b bg-white/95 px-3 backdrop-blur sm:gap-4 sm:px-4 lg:h-[78px] lg:px-8">
          <button
            aria-label="Open mobile sidebar"
            onClick={() => setMobile(true)}
            className="grid size-10 place-items-center rounded-lg border lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <button
            aria-label={sidebar ? "Hide sidebar" : "Show sidebar"}
            onClick={() => setSidebar((x) => !x)}
            className="hidden size-10 place-items-center rounded-lg border text-slate-500 lg:grid"
          >
            {sidebar ? (
              <PanelLeftClose className="size-5" />
            ) : (
              <PanelLeftOpen className="size-5" />
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => {
                setShortcutsOpen((x) => !x);
                setAccountOpen(false);
              }}
              className="flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold text-navy"
            >
              <PlusCircle className="size-4 text-red" />
              <span className="hidden sm:inline">Create</span>
              <ChevronDown className="size-3" />
            </button>
            {shortcutsOpen && (
              <div className="absolute left-0 top-12 z-[190] w-52 rounded-xl border bg-white p-2 shadow-2xl">
                {[
                  ["Add Course", "/dashboard/super-admin/courses/new"],
                  ["Add Category", "/dashboard/super-admin/category"],
                  ["Add Live Classes", "/dashboard/super-admin/live-classes"],
                  ["Add Student", "/dashboard/super-admin/students/new"],
                  ["Add Instructor", "/dashboard/super-admin/instructors/new"],
                  ["Add Staff", "/dashboard/super-admin/staff/new"],
                  ["Add Ticket", "/dashboard/super-admin/support/tickets/new"],
                  [
                    "Add Announcement",
                    "/dashboard/super-admin/announcements/new",
                  ],
                  ["Add FAQ", "/dashboard/super-admin/support/faq/new"],
                  [
                    "Add Email Template",
                    "/dashboard/super-admin/email-templates/new",
                  ],
                ].map(([label, url]) => (
                  <Link
                    key={url}
                    href={url}
                    onClick={() => setShortcutsOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <PlusCircle className="size-3.5 text-red" />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="ml-auto flex min-w-0 items-center gap-4 sm:gap-6">
            <button
              type="button"
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
              title={darkMode ? "Light mode" : "Dark mode"}
              onClick={() => setDarkMode((value) => !value)}
              className="theme-toggle flex h-10 w-[68px] items-center rounded-full border bg-slate-100 p-1 transition-colors"
            >
              <span
                className={`grid size-8 place-items-center rounded-full bg-white text-slate-600 shadow-sm transition-transform ${darkMode ? "translate-x-7" : "translate-x-0"}`}
              >
                {darkMode ? (
                  <Moon className="size-4" />
                ) : (
                  <Sun className="size-4" />
                )}
              </span>
            </button>
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen((x) => !x);
                  setAccountOpen(false);
                  setShortcutsOpen(false);
                }}
                className={`relative grid size-11 place-items-center rounded-lg border ${notifications.length ? "text-red" : "text-slate-500"}`}
              >
                <Bell
                  className={`size-6 ${notifications.length ? "fill-red/10" : ""}`}
                />
                {notifications.length > 0 && (
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-red ring-2 ring-white" />
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-[190] w-[300px] max-w-[85vw] rounded-xl border bg-white p-2 shadow-2xl">
                  <div className="flex items-center justify-between border-b px-3 py-2">
                    <b className="text-sm text-navy">Notifications</b>
                    {notifications.length > 0 && (
                      <button
                        onClick={() =>
                          markNotifications(
                            notifications.map((item) => item.id),
                          )
                        }
                        className="text-[11px] font-bold text-red"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((item) => (
                      <Link
                        key={item.id}
                        href={item.url}
                        onClick={() => {
                          markNotifications([item.id]);
                          setNotificationsOpen(false);
                        }}
                        className="block rounded-lg px-3 py-3 hover:bg-slate-50"
                      >
                        <b className="line-clamp-2 text-xs text-navy">
                          {item.title}
                        </b>
                        <span className="mt-1 block text-[10px] text-slate-400">
                          {new Date(item.date).toLocaleString("en-GB")}
                        </span>
                      </Link>
                    ))}
                    {!notifications.length && (
                      <p className="p-5 text-center text-xs text-slate-400">
                        No notifications
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => {
                  setAccountOpen((x) => !x);
                  setShortcutsOpen(false);
                }}
                className="flex items-center gap-2 rounded-lg"
              >
                <div className="hidden text-right sm:block">
                  <b className="block text-xs text-navy">{name}</b>
                  <span className="text-[10px] text-slate-400">
                    Super Admin
                  </span>
                </div>
                <TopbarProfileAvatar name={name} />
                <ChevronDown className="hidden size-3 text-slate-400 sm:block" />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-12 z-[190] w-48 rounded-xl border bg-white p-2 shadow-2xl">
                  <Link
                    href="/dashboard/super-admin/profile"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <UserRound className="size-4" />
                    Manage Profile
                  </Link>
                  <Link
                    href="/dashboard/super-admin/change-password"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <KeyRound className="size-4" />
                    Change Password
                  </Link>
                  <SignOut light />
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="min-w-0 max-w-full overflow-x-hidden p-3 sm:p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
