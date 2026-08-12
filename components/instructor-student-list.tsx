"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Search } from "lucide-react";
type Student = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  avatar: string | null;
};
export function InstructorStudentList({ students }: { students: Student[] }) {
  const [query, setQuery] = useState("");
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Name</th>
                <th className="p-4">Mail</th>
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
                      <b className="text-navy">{student.name}</b>
                    </div>
                  </td>
                  <td className="p-4">{student.email}</td>
                  <td className="p-4">{student.phone || "—"}</td>
                  <td className="p-4">{student.country || "—"}</td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/dashboard/instructor/my-students/${student.id}`}
                      className="btn-secondary gap-2"
                    >
                      <Eye className="size-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={6} className="p-14 text-center text-slate-400">
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
