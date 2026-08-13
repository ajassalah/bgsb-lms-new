"use client";
import { useEffect, useMemo, useState } from "react";
import { Eye, MoreVertical, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { TablePagination } from "./table-pagination";
export type AssignmentCourseRow = {
  id: string;
  title: string;
  assignmentCount: number;
};
export function CourseAssignmentManagement({
  initialRows,
  basePath = "/dashboard/super-admin/assignments",
}: {
  initialRows: AssignmentCourseRow[];
  basePath?: string;
}) {
  const [rows, setRows] = useState(initialRows),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [menu, setMenu] = useState<string | null>(null),
    router = useRouter();
  const filtered = useMemo(
    () =>
      rows.filter((row) =>
        row.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [rows, query],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 20)),
    visible = filtered.slice((page - 1) * 20, page * 20);
  useEffect(() => {
    function close(event: PointerEvent) {
      if (!(event.target as HTMLElement).closest("[data-assignment-menu]"))
        setMenu(null);
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  return (
    <>
      <div>
        <p className="text-sm text-slate-400">Academic / Assignments</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">Assignments</h1>
        <p className="mt-2 text-sm text-slate-500">
          View and manage assignments by course.
        </p>
      </div>
      <section className="mt-7 overflow-visible rounded-xl border bg-white">
        <div className="border-b p-5">
          <label className="relative block max-w-lg">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="field pl-10"
              placeholder="Search course name..."
            />
          </label>
        </div>
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-5">#</th>
                <th className="p-5">Course</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((r, i) => (
                <tr key={r.id}>
                  <td className="p-5 text-slate-400">
                    {(page - 1) * 20 + i + 1}
                  </td>
                  <td className="p-5">
                    <b className="block text-navy">{r.title}</b>
                    <small className="text-slate-400">
                      {r.assignmentCount} assignments
                    </small>
                  </td>
                  <td className="relative p-5" data-assignment-menu>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setMenu(menu === r.id ? null : r.id)}
                        className="grid size-9 place-items-center rounded-lg border"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </div>
                    {menu === r.id && (
                      <div className="absolute right-5 top-14 z-50 w-40 rounded-xl border bg-white py-1 shadow-xl">
                        <button
                          onClick={() => router.push(`${basePath}/${r.id}`)}
                          className="row-action"
                        >
                          <Eye />
                          View
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination page={page} total={pages} onChange={setPage} />
      </section>
      <style jsx global>{`
        .row-action {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1rem;
          font-size: 0.875rem;
        }
        .row-action:hover {
          background: #f8fafc;
        }
        .row-action svg {
          width: 1rem;
          height: 1rem;
        }
      `}</style>
    </>
  );
}
