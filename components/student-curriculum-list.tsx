"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, MoreVertical, Search } from "lucide-react";

export type StudentCurriculumCourse = {
  id: string;
  title: string;
  category: string;
  status: string;
};

export function StudentCurriculumList({
  courses,
  basePath = "/dashboard/student/curriculum",
  portalLabel = "Student",
}: {
  courses: StudentCurriculumCourse[];
  basePath?: string;
  portalLabel?: string;
}) {
  const [query, setQuery] = useState(""),
    [menu, setMenu] = useState<string | null>(null);
  const rows = useMemo(
    () =>
      courses.filter((course) =>
        `${course.title} ${course.category} ${course.status}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [courses, query],
  );
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest("[data-curriculum-action]"))
        setMenu(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return (
    <>
      <p className="text-sm text-slate-400">{portalLabel} / Curriculum</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">Curriculum</h1>
      <section className="mt-6 overflow-visible rounded-2xl border bg-white">
        <label className="relative m-5 block max-w-lg">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="field pl-10"
            placeholder="Search course title or category..."
          />
        </label>
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Course Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((course, index) => (
                <tr key={course.id}>
                  <td className="p-4 text-slate-400">{index + 1}</td>
                  <td className="p-4 font-bold text-navy">{course.title}</td>
                  <td className="p-4">{course.category}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                      {course.status}
                    </span>
                  </td>
                  <td
                    className="relative p-4 text-right"
                    data-curriculum-action
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setMenu(menu === course.id ? null : course.id)
                      }
                      className="ml-auto grid size-9 place-items-center rounded-lg border"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {menu === course.id && (
                      <div className="absolute right-4 top-14 z-[190] w-36 rounded-xl border bg-white p-1 text-left shadow-2xl">
                        <Link
                          href={`${basePath}/${course.id}`}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-50"
                        >
                          <Eye className="size-4" />
                          View
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    No enrolled courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
