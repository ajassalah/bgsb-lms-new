"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Users,
  X,
} from "lucide-react";
import { SignOut } from "./signout";
import { roleLabels, type Role } from "@/lib/types";

export function DashboardShell({
  role,
  name,
  children,
}: {
  role: Role;
  name: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false),
    nav = [
      ["Overview", LayoutDashboard],
      ["Courses", BookOpen],
      ["People", Users],
      ["Live sessions", CalendarDays],
      ["Reports", BarChart3],
    ] as const;
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  const sidebar = (
    <aside className="flex h-full flex-col bg-navy p-5 text-white sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 text-lg font-bold">
          <GraduationCap />
          BGSB Learning
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="grid size-9 place-items-center rounded-lg hover:bg-white/10 lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="size-5" />
        </button>
      </div>
      <p className="mt-8 text-xs uppercase tracking-widest text-white/40">
        {roleLabels[role]}
      </p>
      <nav className="my-6 space-y-2 overflow-y-auto">
        {nav.map(([label, Icon], index) => (
          <button
            onClick={() => setOpen(false)}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm ${
              index === 0
                ? "bg-white/10 font-semibold"
                : "text-white/60 hover:bg-white/5"
            }`}
            key={label}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto">
        <SignOut />
      </div>
    </aside>
  );
  return (
    <div className="min-h-screen max-w-full overflow-x-hidden lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="sticky top-0 hidden h-screen lg:block">{sidebar}</div>
      {open && (
        <>
          <button
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar overlay"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[86vw] lg:hidden">
            {sidebar}
          </div>
        </>
      )}
      <main className="min-w-0">
        <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between gap-3 border-b bg-white/95 px-3 backdrop-blur sm:px-5 lg:h-20 lg:px-10">
          <button
            onClick={() => setOpen(true)}
            className="grid size-10 place-items-center rounded-xl border lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Welcome back</p>
            <b className="block truncate text-navy">{name}</b>
          </div>
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-red font-bold text-white">
            {name[0]}
          </div>
        </header>
        <div className="min-w-0 p-3 sm:p-6 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
