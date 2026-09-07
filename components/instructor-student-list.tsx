"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Eye,
  MessageCircle,
  MoreVertical,
  Search,
  Users,
} from "lucide-react";
type Student = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  avatar: string | null;
};
export function InstructorCourseList({
  courses,
}: {
  courses: { id: string; title: string; students: number }[];
}) {
  const [query, setQuery] = useState(""),
    [menu, setMenu] = useState<string | null>(null);
  const visible = courses.filter((course) =>
    course.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <p className="text-sm text-slate-400">Instructor / Students</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">My Students</h1>
      <section className="mt-7 overflow-visible rounded-2xl border bg-white shadow-sm">
        <label className="relative m-5 block max-w-lg">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="field pl-10"
            placeholder="Search course name..."
          />
        </label>
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Course Name</th>
                <th className="p-4">Enrolled Students</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((course, index) => (
                <tr key={course.id}>
                  <td className="p-4 text-slate-400">{index + 1}</td>
                  <td className="p-4">
                    <span className="flex items-center gap-3 font-bold text-navy">
                      <BookOpen className="size-5 text-red" />
                      {course.title}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-2">
                      <Users className="size-4 text-blue-600" />
                      {course.students}
                    </span>
                  </td>
                  <td className="relative p-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setMenu(menu === course.id ? null : course.id)
                      }
                      className="inline-grid size-9 place-items-center rounded-lg border"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {menu === course.id && (
                      <div className="absolute right-4 top-14 z-50 w-40 rounded-xl border bg-white p-1 text-left shadow-2xl">
                        <Link
                          href={`/dashboard/instructor/my-students/course/${course.id}`}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-50"
                        >
                          <Eye className="size-4 text-blue-600" />
                          View
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400">
                    No assigned courses found.
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
export function InstructorStudentList({ students }: { students: Student[] }) {
  const [query, setQuery] = useState(""),
    [menu, setMenu] = useState<string | null>(null);
  const visible = useMemo(
    () =>
      students.filter((x) =>
        `${x.name} ${x.email} ${x.phone || ""} ${x.country || ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [students, query],
  );
  return (
    <>
      <p className="text-sm text-slate-400">Instructor / Students</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">My Students</h1>
      <section className="mt-7 overflow-visible rounded-2xl border bg-white shadow-sm">
        <label className="relative m-5 block max-w-lg">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="field pl-10"
            placeholder="Search student name, email, phone or country..."
          />
        </label>
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Name</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Country</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((student, index) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-400">{index + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt=""
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="grid size-10 place-items-center rounded-full bg-navy font-bold text-white">
                          {student.name[0]}
                        </span>
                      )}
                      <span>
                        <b className="block text-navy">{student.name}</b>
                        <small className="text-slate-400">
                          {student.email}
                        </small>
                      </span>
                    </div>
                  </td>
                  <td className="p-4">{student.phone || "—"}</td>
                  <td className="p-4">{student.country || "—"}</td>
                  <td className="relative p-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setMenu(menu === student.id ? null : student.id)
                      }
                      className="inline-grid size-9 place-items-center rounded-lg border"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {menu === student.id && (
                      <div className="absolute right-4 top-14 z-50 w-44 rounded-xl border bg-white p-1 text-left shadow-2xl">
                        <Link
                          href={`/dashboard/instructor/my-students/${student.id}`}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-50"
                        >
                          <Eye className="size-4 text-blue-600" />
                          View
                        </Link>
                        <Link
                          href={`/dashboard/instructor/messages?user=${student.id}`}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-50"
                        >
                          <MessageCircle className="size-4 text-emerald-600" />
                          Message
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={5} className="p-14 text-center text-slate-400">
                    No assigned students found.
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
