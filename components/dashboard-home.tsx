"use client";
import { PartyPopper, X } from "lucide-react";
import { useState } from "react";
import { courses } from "@/lib/demo";
import type { Role } from "@/lib/types";

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
  const [welcomeOpen, setWelcomeOpen] = useState(showStaffWelcome);
  const student = role === "student",
    instructor = role === "instructor";
  const stats = student
    ? [
        ["3", "Active courses"],
        ["72%", "Best progress"],
        ["2", "Upcoming sessions"],
        ["1", "Certificate"],
      ]
    : instructor
      ? [
          ["6", "My courses"],
          ["184", "Students"],
          ["12", "To grade"],
          ["3", "Live sessions"],
        ]
      : [
          ["1,248", "Students"],
          ["38", "Courses"],
          ["14", "Organizations"],
          ["86%", "Completion"],
        ];
  async function closeWelcome() {
    setWelcomeOpen(false);
    await fetch("/api/staff/welcome", { method: "POST" }).catch(() => null);
  }
  return (
    <>
      {welcomeOpen && (
        <div className="fixed inset-0 z-[250] grid place-items-center bg-black/65 p-4 backdrop-blur-sm">
          <section className="relative w-full max-w-xl rounded-3xl border bg-white p-6 shadow-2xl sm:p-9">
            <button
              onClick={closeWelcome}
              aria-label="Close welcome message"
              className="absolute right-5 top-5 grid size-9 place-items-center rounded-full border text-slate-500"
            >
              <X className="size-4" />
            </button>
            <span className="grid size-14 place-items-center rounded-2xl bg-red/10 text-red">
              <PartyPopper className="size-7" />
            </span>
            <p className="mt-6 font-bold text-red">🎉 Welcome to BGSB LMS!</p>
            <h2 className="mt-2 text-2xl font-bold text-navy">
              Welcome, {name}!
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Your <strong className="text-navy">{staffRole || "Staff"}</strong>{" "}
              account is ready.
            </p>
            <p className="mt-3 leading-7 text-slate-600">
              You can now access the LMS features and tools available to your
              role.
            </p>
            <p className="mt-3 leading-7 text-slate-600">
              Take a moment to explore your dashboard and get familiar with your
              workspace.
            </p>
            <p className="mt-4 font-bold text-navy">
              We&apos;re glad to have you on the BGSB LMS team!
            </p>
            <button onClick={closeWelcome} className="btn-primary mt-7 w-full">
              Get Started
            </button>
          </section>
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold text-navy">Dashboard</h1>
        <p className="mt-2 text-slate-500">
          Here&apos;s what&apos;s happening across your learning space.
        </p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([number, title]) => (
          <div className="card" key={title}>
            <b className="text-3xl text-navy">{number}</b>
            <p className="mt-1 text-sm text-slate-500">{title}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 card">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy">
            {student ? "Continue learning" : "Recent activity"}
          </h2>
          <button className="text-sm font-semibold text-red">View all</button>
        </div>
        <div className="mt-6 divide-y">
          {courses.map((course) => (
            <div
              className="grid gap-3 py-5 md:grid-cols-[1fr_200px_60px] md:items-center"
              key={course.slug}
            >
              <div>
                <b className="text-navy">{course.title}</b>
                <p className="text-sm text-slate-500">{course.school}</p>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-red"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{course.progress}%</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
