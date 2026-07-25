"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  BookCopy,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  FileBarChart,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  Megaphone,
  Menu,
  MessageSquareMore,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  ShieldCheck,
  Tags,
  UserCog,
  Users,
  Video,
  X,
} from "lucide-react";
import { SignOut } from "./signout";

const groups = [
  {
    label: "Main",
    items: [["Dashboard", LayoutDashboard, "/dashboard/super-admin"]],
  },
  {
    label: "Academic",
    items: [
      ["Enrollment", LibraryBig, "/dashboard/super-admin/enrollments"],
      ["Courses", BookCopy, "/dashboard/super-admin/courses"],
      ["Live classes", Video, "/dashboard/super-admin/live-classes"],
      ["Assignments", ClipboardCheck, "/dashboard/super-admin/assignments"],
    ],
  },
  {
    label: "People",
    items: [
      ["Manage Student", Users, "/dashboard/super-admin/students"],
      ["Organizations", Building2, "#"],
      ["Instructors", GraduationCap, "/dashboard/super-admin/instructors"],
      ["Staff", UserCog, "/dashboard/super-admin/staff"],
      ["Roles & permissions", ShieldCheck, "#"],
    ],
  },
  {
    label: "Communication",
    items: [
      ["Announcements", Megaphone, "#"],
      ["Messages", MessageSquareMore, "#"],
      ["Calendar", CalendarDays, "#"],
    ],
  },
  {
    label: "Platform",
    items: [
      ["Reports", FileBarChart, "#"],
      ["System settings", Settings, "#"],
      ["Help & support", CircleHelp, "#"],
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
  const sidebar = true;
  const setSidebar = (_: boolean | ((value: boolean) => boolean)) => {};
  const pathname = usePathname() || "";
  const [coursesOpen, setCoursesOpen] = useState(
      pathname.includes("/dashboard/super-admin/") &&
        pathname !== "/dashboard/super-admin",
    ),
    [mobile, setMobile] = useState(false);
  const courseLinks = [
    ["Course List", "courses"],
    ["Category", "category"],
    ["Certificates", "certificates"],
  ] as const;
  return (
    <div className="min-h-screen bg-[#f5f6fa] lg:grid lg:grid-cols-[278px_1fr]">
      {mobile && (
        <button
          aria-label="Close sidebar"
          onClick={() => setMobile(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}
      <aside
        className={`${mobile ? "fixed inset-y-0 left-0 z-50 flex w-[278px]" : "hidden"} min-h-screen bg-[#111827] text-white lg:flex lg:flex-col`}
      >
        <div className="flex h-[78px] items-center gap-3 border-b border-white/10 px-4">
          <Link
            href="/dashboard/super-admin"
            className="flex h-14 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-white px-3 py-2"
          >
            <img
              src="https://bgsb.lk/bgs-logo.png"
              alt="BGSB"
              className="h-full w-full object-contain"
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
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {groups.map((group) => (
            <div className="mb-6" key={group.label}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/30">
                {group.label}
              </p>
              <nav className="space-y-1">
                {group.items.map(([label, Icon, href]) =>
                  label === "Courses" ? (
                    <div key={label}>
                      <button
                        onClick={() => setCoursesOpen((x) => !x)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition ${pathname.includes("/dashboard/super-admin/") ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                      >
                        <Icon className="size-[18px]" />
                        <span>Courses</span>
                        <ChevronDown
                          className={`ml-auto size-3.5 transition ${coursesOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {coursesOpen && (
                        <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                          {courseLinks.map(([name, slug]) => {
                            const url = `/dashboard/super-admin/${slug}`;
                            return (
                              <Link
                                href={url}
                                className={`block rounded-lg px-3 py-2 text-xs transition ${pathname === url ? "bg-red text-white" : "text-white/45 hover:bg-white/5 hover:text-white"}`}
                                key={slug}
                              >
                                {name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={href}
                      key={label}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition ${pathname === href ? "bg-red font-semibold text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                    >
                      <Icon className="size-[18px]" />
                      <span>{label}</span>
                      {["Organizations", "System settings"].includes(label) && (
                        <ChevronDown className="ml-auto size-3.5 opacity-40" />
                      )}
                    </Link>
                  ),
                )}
              </nav>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-white/10 text-sm font-bold">
              {name[0]}
            </span>
            <div className="min-w-0">
              <b className="block truncate text-xs">{name}</b>
              <span className="text-[10px] text-white/40">
                Super Administrator
              </span>
            </div>
          </div>
          <SignOut />
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex h-[78px] items-center gap-4 border-b bg-white px-4 lg:px-8">
          <button
            aria-label="Open mobile sidebar"
            onClick={() => setMobile(true)}
            className="grid size-10 place-items-center rounded-lg border lg:hidden"
          >
            <Menu />
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
          <div className="relative hidden w-full max-w-md sm:block">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-lg bg-slate-100 py-2.5 pl-10 pr-4 text-sm outline-none"
              placeholder="Search courses, users, organizations..."
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative grid size-10 place-items-center rounded-lg border text-slate-500">
              <Megaphone className="size-4" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-red" />
            </button>
            <div className="hidden text-right sm:block">
              <b className="block text-xs text-navy">{name}</b>
              <span className="text-[10px] text-slate-400">Super Admin</span>
            </div>
            <div className="grid size-10 place-items-center rounded-lg bg-navy font-bold text-white">
              {name[0]}
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
