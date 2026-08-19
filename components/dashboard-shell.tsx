"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  GraduationCap,
  FolderLock,
  LayoutDashboard,
  ListTree,
  LifeBuoy,
  Menu,
  MessageSquare,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Radio,
  Sun,
  Ticket,
  UserRound,
  KeyRound,
  Users,
  X,
} from "lucide-react";
import { SignOut } from "./signout";
import { TopbarProfileAvatar } from "./topbar-profile-avatar";
import { roleLabels, type Role } from "@/lib/types";

export function DashboardShell({
  role,
  name,
  email,
  avatar,
  children,
}: {
  role: Role;
  name: string;
  email?: string | null;
  avatar?: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false),
    [sidebarExpanded, setSidebarExpanded] = useState(true),
    [supportOpen, setSupportOpen] = useState(false),
    [createOpen, setCreateOpen] = useState(false),
    [notificationsOpen, setNotificationsOpen] = useState(false),
    [notifications, setNotifications] = useState<
      { id: string; title: string; url: string; date: string }[]
    >([]),
    [accountOpen, setAccountOpen] = useState(false),
    [darkMode, setDarkMode] = useState(false),
    [themeReady, setThemeReady] = useState(false),
    [unreadMessages, setUnreadMessages] = useState(0),
    pathname = usePathname() || "",
    nav = [
      ["Overview", LayoutDashboard],
      ["Courses", BookOpen],
      ["People", Users],
      ["Live sessions", CalendarDays],
      ["Reports", BarChart3],
    ] as const;
  const instructorNav = [
    ["Dashboard", LayoutDashboard, "/dashboard/instructor"],
    ["My Courses", BookOpen, "/dashboard/instructor/my-courses"],
    ["Curriculum", ListTree, "/dashboard/instructor/curriculum"],
    ["Assignment", ClipboardList, "/dashboard/instructor/assignments"],
    ["My Students", Users, "/dashboard/instructor/my-students"],
    ["Certificate", Award, "/dashboard/instructor/certificates"],
    ["Live Classes", Radio, "/dashboard/instructor/live-classes"],
    ["Calendar", CalendarDays, "/dashboard/instructor/calendar"],
    ["Announcement", Bell, "/dashboard/instructor/announcements"],
    ["Messages", MessageSquare, "/dashboard/instructor/messages"],
    ["Private File", FolderLock, "/dashboard/instructor/private-files"],
    ["Reports", BarChart3, "/dashboard/instructor/reports"],
  ] as const;
  const studentNav = [
    ["Dashboard", LayoutDashboard, "/dashboard/student"],
    ["My Courses", BookOpen, "/dashboard/student/courses"],
    ["Curriculum", ListTree, "/dashboard/student/curriculum"],
    ["My Assignments", ClipboardList, "/dashboard/student/assignments"],
    ["Quiz", CircleHelp, "/dashboard/student/quiz"],
    ["Certificates", Award, "/dashboard/student/certificates"],
    ["Announcement", Bell, "/dashboard/student/announcements"],
    ["Messages", MessageSquare, "/dashboard/student/messages"],
    ["Meetings", Radio, "/dashboard/student/meetings"],
    ["Calendar", CalendarDays, "/dashboard/student/calendar"],
    ["Private File", FolderLock, "/dashboard/student/private-files"],
    ["Report", BarChart3, "/dashboard/student/reports"],
  ] as const;
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
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
    if (!themeReady) return;
    window.localStorage.setItem(
      "bgsb-admin-theme",
      darkMode ? "dark" : "light",
    );
    document.documentElement.classList.toggle("admin-dark", darkMode);
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
    const timer = window.setInterval(refreshNotifications, 15000);
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
  function readNotification(id: string) {
    setNotifications((rows) => rows.filter((x) => x.id !== id));
    fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    }).catch(() => {});
  }
  const sidebar = (
    <aside className="flex h-full flex-col overflow-hidden bg-[#111827] text-white">
      <div className="relative flex items-center justify-between gap-3">
        <Link
          href="/dashboard/instructor"
          className={`m-4 flex h-14 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-white ${sidebarExpanded ? "px-3 py-2" : "p-1"}`}
        >
          <img
            src={
              sidebarExpanded ? "https://bgsb.lk/bgs-logo.png" : "/cropped-.png"
            }
            alt="BGSB"
            className="hidden h-full max-w-full object-contain lg:block"
          />
          <img
            src="https://bgsb.lk/bgs-logo.png"
            alt="BGSB"
            className="h-full max-w-full object-contain lg:hidden"
          />
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="absolute right-2 top-2 grid size-10 place-items-center rounded-xl bg-white/10 hover:bg-white/15 lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="size-5" />
        </button>
      </div>
      <p
        className={`px-6 pt-3 text-xs font-bold uppercase tracking-[.18em] text-white/30 ${sidebarExpanded ? "" : "lg:hidden"}`}
      >
        {roleLabels[role]}
      </p>
      {role === "student" && sidebarExpanded && (
        <div className="mx-4 mt-4 rounded-xl bg-white/5 p-4 text-center">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="mx-auto size-16 rounded-full object-cover ring-2 ring-white/20"
            />
          ) : (
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-white/10 text-xl font-bold">
              {name.charAt(0)}
            </span>
          )}
          <b className="mt-3 block truncate text-sm text-white">{name}</b>
          <small className="block truncate text-white/45">
            {email || "Student"}
          </small>
        </div>
      )}
      <nav
        className={`my-4 flex-1 space-y-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${sidebarExpanded ? "px-4" : "px-2"}`}
      >
        {role === "instructor" || role === "student"
          ? (role === "instructor" ? instructorNav : studentNav).map(
              ([label, Icon, href]) => {
                const active =
                  pathname === href ||
                  (href !== `/dashboard/${role}` &&
                    pathname.startsWith(`${href}/`));
                return (
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    title={!sidebarExpanded ? label : undefined}
                    className={`relative flex min-h-12 w-full items-center gap-3 rounded-lg py-3 text-[15px] font-medium transition ${sidebarExpanded ? "px-3" : "justify-center px-0 max-lg:justify-start max-lg:px-3"} ${active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"}`}
                    key={label}
                  >
                    <Icon className="size-[18px] shrink-0" />
                    <span className={sidebarExpanded ? "" : "lg:hidden"}>
                      {label}
                    </span>
                    {label === "Messages" && unreadMessages > 0 && (
                      <span
                        className={`${sidebarExpanded ? "ml-auto" : "absolute right-1 top-1"} grid min-w-5 place-items-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-bold leading-4 text-white`}
                      >
                        {unreadMessages > 99 ? "99+" : unreadMessages}
                      </span>
                    )}
                  </Link>
                );
              },
            )
          : nav.map(([label, Icon], index) => (
              <button
                onClick={() => setOpen(false)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm ${index === 0 ? "bg-white/10 font-semibold" : "text-white/60 hover:bg-white/5"}`}
                key={label}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
        {role === "instructor" && (
          <div>
            <button
              type="button"
              onClick={() => setSupportOpen((value) => !value)}
              title={!sidebarExpanded ? "Support" : undefined}
              className={`flex w-full items-center gap-3 rounded-lg py-3 text-[15px] font-medium transition ${sidebarExpanded ? "px-3" : "justify-center px-0"} ${pathname.startsWith("/dashboard/instructor/support") ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"}`}
            >
              <LifeBuoy className="size-[18px]" />
              <span
                className={`flex-1 text-left ${sidebarExpanded ? "" : "lg:hidden"}`}
              >
                Support
              </span>
              <ChevronDown
                className={`size-4 transition ${supportOpen ? "rotate-180" : ""} ${sidebarExpanded ? "" : "lg:hidden"}`}
              />
            </button>
            {sidebarExpanded &&
              (supportOpen ||
                pathname.startsWith("/dashboard/instructor/support")) && (
                <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                  {[
                    [
                      "Tickets",
                      Ticket,
                      "/dashboard/instructor/support/tickets",
                    ],
                    ["FAQ", CircleHelp, "/dashboard/instructor/support/faq"],
                    [
                      "Help & Support",
                      LifeBuoy,
                      "/dashboard/instructor/support/help",
                    ],
                  ].map(([label, Icon, href]) => (
                    <Link
                      key={label as string}
                      href={href as string}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${pathname === href ? "bg-white/10 text-white" : "text-white/55 hover:text-white"}`}
                    >
                      <Icon className="size-4" />
                      {label as string}
                    </Link>
                  ))}
                </div>
              )}
          </div>
        )}
        {role === "student" && (
          <div>
            <button
              type="button"
              onClick={() => setSupportOpen((value) => !value)}
              className={`flex w-full items-center gap-3 rounded-lg py-3 text-[15px] font-medium ${sidebarExpanded ? "px-3" : "justify-center px-0"} ${pathname.startsWith("/dashboard/student/support") ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"}`}
            >
              <LifeBuoy className="size-[18px]" />
              <span
                className={sidebarExpanded ? "flex-1 text-left" : "lg:hidden"}
              >
                Help & Support
              </span>
              <ChevronDown
                className={`size-4 ${supportOpen ? "rotate-180" : ""} ${sidebarExpanded ? "" : "lg:hidden"}`}
              />
            </button>
            {sidebarExpanded &&
              (supportOpen ||
                pathname.startsWith("/dashboard/student/support")) && (
                <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                  {[
                    ["Tickets", Ticket, "/dashboard/student/support/tickets"],
                    ["FAQ", CircleHelp, "/dashboard/student/support/faq"],
                  ].map(([label, Icon, href]) => (
                    <Link
                      key={label as string}
                      href={href as string}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${pathname === href ? "bg-white/10 text-white" : "text-white/55 hover:text-white"}`}
                    >
                      <Icon className="size-4" />
                      {label as string}
                    </Link>
                  ))}
                </div>
              )}
          </div>
        )}
      </nav>
      {!(["instructor", "student"] as Role[]).includes(role) && (
        <div className="mt-auto">
          <SignOut />
        </div>
      )}
    </aside>
  );
  return (
    <div
      data-admin-shell
      className={`min-h-screen max-w-full overflow-x-hidden bg-slate-50 transition-[padding] ${darkMode ? "admin-dark" : ""} ${sidebarExpanded ? "lg:pl-[278px]" : "lg:pl-[84px]"}`}
    >
      <div
        className={`fixed inset-y-0 left-0 z-40 hidden transition-[width] lg:block ${sidebarExpanded ? "w-[278px]" : "w-[84px]"}`}
      >
        {sidebar}
      </div>
      {open && (
        <>
          <button
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar overlay"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[320px] max-w-[88vw] shadow-2xl lg:hidden">
            {sidebar}
          </div>
        </>
      )}
      <main className="min-w-0">
        <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between gap-3 border-b bg-white/95 px-3 shadow-sm backdrop-blur sm:px-5 lg:h-[78px] lg:px-8">
          <button
            onClick={() => setOpen(true)}
            className="grid size-10 place-items-center rounded-xl border lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="size-5" />
          </button>
          <button
            onClick={() => setSidebarExpanded((value) => !value)}
            className="hidden size-10 place-items-center rounded-lg border text-slate-500 lg:grid"
            aria-label="Toggle sidebar"
          >
            {sidebarExpanded ? (
              <PanelLeftClose className="size-5" />
            ) : (
              <PanelLeftOpen className="size-5" />
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => {
                setCreateOpen((value) => !value);
                setAccountOpen(false);
                setNotificationsOpen(false);
              }}
              className="flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold text-navy"
            >
              <PlusCircle className="size-4 text-red" />
              <span className="hidden sm:inline">Create</span>
              <ChevronDown className="size-3" />
            </button>
            {createOpen && (
              <div className="absolute left-0 top-12 z-[190] w-52 rounded-xl border bg-white p-2 shadow-2xl">
                {(role === "student"
                  ? [
                      [
                        "Submit Assignment",
                        "/dashboard/student/assignments",
                        ClipboardList,
                      ],
                      [
                        "Create Ticket",
                        "/dashboard/student/support/tickets/new",
                        Ticket,
                      ],
                      [
                        "Create Private File",
                        "/dashboard/student/private-files",
                        FolderLock,
                      ],
                      [
                        "Create Appointment",
                        "/dashboard/student/calendar",
                        CalendarDays,
                      ],
                    ]
                  : [
                      [
                        "Create Assignment",
                        "/dashboard/instructor/assignments",
                        ClipboardList,
                      ],
                      [
                        "Create Live Class",
                        "/dashboard/instructor/live-classes",
                        Radio,
                      ],
                      [
                        "Create Announcement",
                        "/dashboard/instructor/announcements",
                        Bell,
                      ],
                      [
                        "Create Ticket",
                        "/dashboard/instructor/support/tickets",
                        Ticket,
                      ],
                    ]
                ).map(([label, href, Icon]) => (
                  <Link
                    key={String(href)}
                    href={String(href)}
                    onClick={() => setCreateOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <Icon className="size-3.5 text-red" />
                    {String(label)}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setDarkMode((value) => !value)}
              aria-label="Toggle light and dark mode"
              className="theme-toggle flex h-10 w-[68px] items-center rounded-full border bg-slate-100 p-1"
            >
              <span
                className={`grid size-8 place-items-center rounded-full bg-white text-slate-600 shadow-sm transition-transform ${darkMode ? "translate-x-7" : ""}`}
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
                  setNotificationsOpen((value) => !value);
                  setAccountOpen(false);
                  setCreateOpen(false);
                }}
                className="relative grid size-11 place-items-center rounded-lg border text-slate-500"
              >
                <Bell
                  className={`size-6 ${notifications.length ? "text-red" : ""}`}
                />
                {!!notifications.length && (
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-red ring-2 ring-white" />
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-[190] w-[300px] max-w-[85vw] rounded-xl border bg-white p-2 text-xs shadow-2xl">
                  <b className="block border-b px-3 py-2 text-navy">
                    Notifications
                  </b>
                  {notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.url}
                      onClick={() => {
                        readNotification(item.id);
                        setNotificationsOpen(false);
                      }}
                      className="block rounded-lg px-3 py-3 hover:bg-slate-50"
                    >
                      <b className="block text-navy">{item.title}</b>
                      <small className="mt-1 block text-slate-400">
                        {new Date(item.date).toLocaleString("en-GB")}
                      </small>
                    </Link>
                  ))}
                  {!notifications.length && (
                    <p className="p-5 text-center text-slate-400">
                      No notifications
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => {
                  setAccountOpen((value) => !value);
                  setCreateOpen(false);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2"
              >
                <span className="hidden text-right sm:block">
                  <b className="block text-xs text-navy">{name}</b>
                  <span className="text-[10px] text-slate-400">
                    {roleLabels[role]}
                  </span>
                </span>
                <TopbarProfileAvatar name={name} avatar={avatar} />
                <ChevronDown className="hidden size-3 text-slate-400 sm:block" />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-12 z-[190] w-48 rounded-xl border bg-white p-2 shadow-2xl">
                  <Link
                    href={`/dashboard/${role}/profile`}
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <UserRound className="size-4" />
                    Manage Profile
                  </Link>
                  <Link
                    href={`/dashboard/${role}/change-password`}
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
        <div className="min-w-0 p-3 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
