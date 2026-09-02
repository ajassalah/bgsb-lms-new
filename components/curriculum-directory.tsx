"use client";

import Link from "next/link";
import { Eye, MoreVertical, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type CurriculumCourseRow = {
  id: string;
  title: string;
  category: string;
  status: string;
};

export function CurriculumDirectory({
  rows,
  basePath,
}: {
  rows: CurriculumCourseRow[];
  basePath: string;
}) {
  const [query, setQuery] = useState(""),
    [menu, setMenu] = useState<string | null>(null);
  const filtered = useMemo(
    () =>
      rows.filter((row) =>
        `${row.title} ${row.category} ${row.status}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [rows, query],
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
      <div>
        <p className="text-sm text-slate-400">Courses / Curriculum</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">Curriculum</h1>
        <p className="mt-2 text-sm text-slate-500">
          Select a course to view and manage its modules and learning materials.
        </p>
      </div>
      <section className="mt-7 overflow-visible rounded-2xl border bg-white">
        <div className="border-b p-4 sm:p-5">
          <label className="relative block max-w-xl">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="field pl-10"
              placeholder="Search course title, category or status..."
            />
          </label>
        </div>
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[760px] text-left text-sm">
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
              {filtered.map((row, index) => (
                <tr key={row.id}>
                  <td className="p-4 text-slate-400">{index + 1}</td>
                  <td className="p-4 font-bold text-navy">{row.title}</td>
                  <td className="p-4">{row.category}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${row.status === "published" ? "bg-emerald-50 text-emerald-700" : row.status === "draft" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="relative p-4" data-curriculum-action>
                    <button
                      onClick={() => setMenu(menu === row.id ? null : row.id)}
                      className="ml-auto grid size-9 place-items-center rounded-lg border"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {menu === row.id && (
                      <div className="absolute right-4 top-14 z-[200] w-40 rounded-xl border bg-white p-1 shadow-2xl">
                        <Link
                          href={`${basePath}/courses/${row.id}/curriculum`}
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
              {!filtered.length && (
                <tr>
                  <td colSpan={5} className="p-14 text-center text-slate-400">
                    No courses match your search.
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
