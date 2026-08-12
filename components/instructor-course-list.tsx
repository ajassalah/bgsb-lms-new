"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  Filter,
  ListTree,
  MoreVertical,
  Search,
  Users,
} from "lucide-react";
export type InstructorCourse = {
  id: string;
  title: string;
  category: string;
  students: number;
  status: string;
};
export function InstructorCourseList({
  courses,
  basePath = "/dashboard/instructor/my-courses",
  studentView = false,
}: {
  courses: InstructorCourse[];
  basePath?: string;
  studentView?: boolean;
}) {
  const [query, setQuery] = useState(""),
    [filters, setFilters] = useState(false),
    [status, setStatus] = useState("all"),
    [menu, setMenu] = useState<string | null>(null),
    [page, setPage] = useState(1);
  const filtered = useMemo(
      () =>
        courses.filter(
          (x) =>
            x.title.toLowerCase().includes(query.toLowerCase()) &&
            (status === "all" || x.status === status),
        ),
      [courses, query, status],
    ),
    pages = Math.max(1, Math.ceil(filtered.length / 10)),
    visible = filtered.slice((page - 1) * 10, page * 10);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{studentView ? "Student" : "Instructor"} / Courses</p>
          <h1 className="mt-1 text-2xl font-bold text-navy">My Courses</h1>
        </div>
        <button
          onClick={() => setFilters((x) => !x)}
          className="btn-secondary gap-2"
        >
          <Filter className="size-4" />
          Filter
        </button>
      </div>
      {filters && (
        <div className="mt-5 flex gap-3 rounded-xl border bg-white p-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="field max-w-xs"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      )}
      <section className="mt-6 overflow-visible rounded-2xl border bg-white">
        <label className="relative m-5 block max-w-lg">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="field pl-10"
            placeholder="Search course..."
          />
        </label>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Course Name</th>
                <th className="p-4">Category</th>
                {!studentView && <th className="p-4">Enrolled Students</th>}
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((x, i) => (
                <tr key={x.id}>
                  <td className="p-4 text-slate-400">
                    {(page - 1) * 10 + i + 1}
                  </td>
                  <td className="p-4 font-bold text-navy">
                    <span className="flex items-center gap-2">
                      <BookOpen className="size-4 text-red" />
                      {x.title}
                    </span>
                  </td>
                  <td className="p-4">{x.category}</td>
                  {!studentView && <td className="p-4">
                    <span className="flex items-center gap-2">
                      <Users className="size-4" />
                      {x.students}
                    </span>
                  </td>}
                  <td className="p-4">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                      {x.status}
                    </span>
                  </td>
                  <td className="relative p-4 text-right">
                    <button
                      onClick={() => setMenu(menu === x.id ? null : x.id)}
                      className="grid size-9 place-items-center rounded-lg border ml-auto"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {menu === x.id && (
                      <div className="absolute right-4 top-14 z-[190] w-48 rounded-xl border bg-white p-1 text-left shadow-2xl">
                        <Link
                          href={`${basePath}/${x.id}/curriculum`}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-50"
                        >
                          <ListTree className="size-4" />
                          Curriculum
                        </Link>
                        <Link
                          href={`${basePath}/${x.id}/faq`}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-50"
                        >
                          <FileQuestion className="size-4" />
                          FAQ
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2 border-t p-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="btn-secondary"
          >
            <ChevronLeft className="size-4" />
            Previous
          </button>
          <span className="px-3 py-2 text-sm">
            {page} / {pages}
          </span>
          <button
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
            className="btn-secondary"
          >
            Next
            <ChevronRight className="size-4" />
          </button>
        </div>
      </section>
    </>
  );
}
