"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  Bell,
  CircleAlert,
  ChevronDown,
  KeyRound,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Sun,
  UserRound,
} from "lucide-react";
import { SignOut } from "./signout";
import { TopbarProfileAvatar } from "./topbar-profile-avatar";
type Actions = Record<string, boolean>;
const createLinks = [
  ["Add Course", "/dashboard/admin-staff/courses/new", "courses", "create"],
  ["Add Category", "/dashboard/admin-staff/category", "categories", "create"],
  [
    "Add Live Class",
    "/dashboard/admin-staff/live-classes",
    "live_classes",
    "create",
  ],
  ["Add Student", "/dashboard/admin-staff/students/new", "students", "create"],
  [
    "Add Instructor",
    "/dashboard/admin-staff/instructors/new",
    "instructors",
    "create",
  ],
  ["Add Staff", "/dashboard/admin-staff/staff/new", "staff", "create"],
  [
    "Add Ticket",
    "/dashboard/admin-staff/support/tickets/new",
    "tickets",
    "create",
  ],
  [
    "Add Announcement",
    "/dashboard/admin-staff/announcements/new",
    "announcements",
    "create",
  ],
  ["Add FAQ", "/dashboard/admin-staff/support/faq/new", "faq", "create"],
  [
    "Add Email Template",
    "/dashboard/admin-staff/email-templates/new",
    "email_templates",
    "create",
  ],
] as const;
export function StaffTopbar({
  name,
  roleName,
  permissions,
  expanded,
  openMobile,
  toggleSidebar,
}: {
  name: string;
  roleName: string;
  permissions: Record<string, Actions>;
  expanded: boolean;
  openMobile: () => void;
  toggleSidebar: () => void;
}) {
  const path = usePathname(),
    [createOpen, setCreateOpen] = useState(false),
    [notificationOpen, setNotificationOpen] = useState(false),
    [accountOpen, setAccountOpen] = useState(false),
    [dark, setDark] = useState(false),
    [themeReady, setThemeReady] = useState(false),
    [notifications, setNotifications] = useState<
      { id: string; title: string; url: string; date: string }[]
    >([]),
    shortcuts = createLinks.filter(
      ([, , module, action]) => permissions[module]?.[action],
    );
  useLayoutEffect(() => {
    const saved = localStorage.getItem("bgsb-admin-theme");
    const enabled = saved
      ? saved === "dark"
      : document.documentElement.classList.contains("admin-dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(enabled);
    document.documentElement.classList.toggle("admin-dark", enabled);
    setThemeReady(true);
  }, []);
  useEffect(() => {
    let active = true;
    const refreshNotifications = () =>
      fetch("/api/admin/notifications", { cache: "no-store" })
        .then((r) => r.json())
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
  }, [path]);
  useEffect(() => {
    if (!themeReady) return;
    localStorage.setItem("bgsb-admin-theme", dark ? "dark" : "light");
    document.documentElement.classList.toggle("admin-dark", dark);
  }, [dark, themeReady]);
  function clear(ids: string[]) {
    setNotifications((rows) => rows.filter((x) => !ids.includes(x.id)));
    fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids }),
    }).catch(() => {});
  }
  return (
    <header className="sticky top-0 z-30 flex h-[70px] items-center gap-2 border-b bg-white/95 px-3 shadow-sm backdrop-blur sm:gap-4 lg:h-[78px] lg:px-8">
      <button
        onClick={openMobile}
        className="grid size-10 place-items-center rounded-lg border lg:hidden"
      >
        <Menu className="size-5" />
      </button>
      <button
        onClick={toggleSidebar}
        className="hidden size-10 place-items-center rounded-lg border lg:grid"
      >
        {expanded ? (
          <PanelLeftClose className="size-5" />
        ) : (
          <PanelLeftOpen className="size-5" />
        )}
      </button>
      <div className="relative">
        <button
          onClick={() => {
            setCreateOpen((x) => !x);
            setNotificationOpen(false);
            setAccountOpen(false);
          }}
          className="flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold text-navy"
        >
          <PlusCircle className="size-4 text-red" />
          <span className="hidden sm:inline">Create</span>
          <ChevronDown className="size-3" />
        </button>
        {createOpen && (
          <div className="absolute left-0 top-12 z-[190] w-52 rounded-xl border bg-white p-2 shadow-2xl">
            {shortcuts.map(([label, url]) => (
              <Link
                key={url}
                href={url}
                onClick={() => setCreateOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <PlusCircle className="size-3.5 text-red" />
                {label}
              </Link>
            ))}
            {!shortcuts.length && (
              <p className="p-3 text-xs text-slate-400">
                No create permissions.
              </p>
            )}
          </div>
        )}
      </div>
      <div className="ml-auto flex items-center gap-3 sm:gap-5">
        <button
          onClick={() => setDark((x) => !x)}
          aria-label="Toggle light and dark mode"
          className="theme-toggle flex h-10 w-[68px] items-center rounded-full border bg-slate-100 p-1"
        >
          <span
            className={`grid size-8 place-items-center rounded-full bg-white shadow transition-transform ${dark ? "translate-x-7" : ""}`}
          >
            {dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </span>
        </button>
        <div className="relative">
          <button
            onClick={() => {
              setNotificationOpen((x) => !x);
              setCreateOpen(false);
              setAccountOpen(false);
            }}
            className={`relative grid size-11 place-items-center rounded-lg border ${notifications.length ? "text-red" : "text-slate-500"}`}
          >
            <Bell className="size-6" />
            {notifications.length > 0 && (
              <span className="absolute right-2 top-2 size-2 rounded-full bg-red ring-2 ring-white" />
            )}
          </button>
          {notificationOpen && (
            <div className="absolute right-0 top-12 z-[190] w-[300px] max-w-[85vw] rounded-xl border bg-white p-2 shadow-2xl">
              <div className="flex justify-between border-b px-3 py-2">
                <b className="text-sm text-navy">Notifications</b>
                {notifications.length > 0 && (
                  <button
                    onClick={() => clear(notifications.map((x) => x.id))}
                    className="text-xs font-bold text-red"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url}
                    onClick={() => {
                      clear([item.id]);
                      setNotificationOpen(false);
                    }}
                    className="flex gap-3 rounded-lg px-3 py-3 hover:bg-slate-50"
                  >
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-red" />
                    <span>
                      <b className="line-clamp-2 text-xs text-navy">
                        {item.title}
                      </b>
                      <span className="mt-1 block text-[10px] text-slate-400">
                        {new Date(item.date).toLocaleString("en-GB")}
                      </span>
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
              setCreateOpen(false);
              setNotificationOpen(false);
            }}
            className="flex items-center gap-2"
          >
            <div className="hidden text-right sm:block">
              <b className="block text-xs text-navy">{name}</b>
              <span className="text-[10px] text-slate-400">{roleName}</span>
            </div>
            <TopbarProfileAvatar name={name} />
            <ChevronDown className="hidden size-3 sm:block" />
          </button>
          {accountOpen && (
            <div className="absolute right-0 top-12 z-[190] w-48 rounded-xl border bg-white p-2 shadow-2xl">
              <Link
                href="/dashboard/admin-staff/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <UserRound className="size-4" />
                Manage Profile
              </Link>
              <Link
                href="/dashboard/admin-staff/change-password"
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
  );
}
