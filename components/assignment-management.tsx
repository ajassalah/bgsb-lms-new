"use client";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
export type AssignmentRow = {
  id: string;
  title: string;
  instructor: string;
  passMarks: number;
  totalMarks: number;
  deadline: string;
};
export function AssignmentManagement({
  courseId,
  moduleId,
  courseTitle,
  moduleTitle,
  initialRows,
}: {
  courseId: string;
  moduleId: string;
  courseTitle: string;
  moduleTitle: string;
  initialRows: AssignmentRow[];
}) {
  const [rows, setRows] = useState(initialRows),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [menu, setMenu] = useState<string | null>(null),
    [deleting, setDeleting] = useState<AssignmentRow | null>(null),
    router = useRouter();
  const filtered = useMemo(
      () =>
        rows.filter((x) =>
          `${x.title} ${x.instructor}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
      [rows, query],
    ),
    pages = Math.max(1, Math.ceil(filtered.length / 10)),
    visible = filtered.slice((page - 1) * 10, page * 10);
  async function remove() {
    if (!deleting) return;
    const res = await fetch(`/api/admin/assignments/${deleting.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setRows((x) => x.filter((y) => y.id !== deleting.id));
      setDeleting(null);
      toast.success("Assignment deleted");
    } else toast.error("Delete failed");
  }
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">
            {courseTitle} / {moduleTitle}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-navy">Assignments</h1>
        </div>
        <button
          onClick={() =>
            router.push(
              `/dashboard/super-admin/courses/${courseId}/curriculum/${moduleId}/assignments/new`,
            )
          }
          className="btn-primary gap-2"
        >
          <Plus className="size-4" />
          Add Assignment
        </button>
      </div>
      <section className="mt-7 overflow-visible rounded-xl border bg-white">
        <div className="border-b p-5">
          <label className="relative block max-w-lg">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="field py-2.5 pl-10"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search assignments..."
            />
          </label>
        </div>
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Title</th>
                <th className="p-4">Instructor</th>
                <th className="p-4">Pass Marks</th>
                <th className="p-4">Total Marks</th>
                <th className="p-4">Deadline</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((r, i) => (
                <tr key={r.id}>
                  <td className="p-4">{(page - 1) * 10 + i + 1}</td>
                  <td className="p-4 font-semibold text-navy">{r.title}</td>
                  <td className="p-4">{r.instructor}</td>
                  <td className="p-4">{r.passMarks}</td>
                  <td className="p-4">{r.totalMarks}</td>
                  <td className="p-4">
                    {new Date(r.deadline).toLocaleDateString("en-GB")}
                  </td>
                  <td className="relative p-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setMenu(menu === r.id ? null : r.id)}
                        className="grid size-9 place-items-center rounded-lg border"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </div>
                    {menu === r.id && (
                      <div className="absolute right-4 top-14 z-[100] w-40 rounded-lg border bg-white py-1 shadow-xl">
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/super-admin/courses/${courseId}/curriculum/${moduleId}/assignments/${r.id}/edit`,
                            )
                          }
                          className="row-action"
                        >
                          <Edit3 />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeleting(r);
                            setMenu(null);
                          }}
                          className="row-action text-red"
                        >
                          <Trash2 />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap justify-end gap-1 border-t p-4">
          <Page disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft />
            Previous
          </Page>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              onClick={() => setPage(n)}
              className={`grid size-9 place-items-center rounded-lg ${page === n ? "bg-red text-white" : "border"}`}
              key={n}
            >
              {n}
            </button>
          ))}
          <Page disabled={page === pages} onClick={() => setPage(page + 1)}>
            Next
            <ChevronRight />
          </Page>
        </div>
      </section>
      {deleting && (
        <div className="fixed inset-0 z-[150] grid place-items-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:p-4">
          <div className="my-auto max-h-[94dvh] w-full max-w-sm overflow-y-auto rounded-xl bg-white p-4 shadow-2xl sm:max-w-md sm:rounded-2xl sm:p-6">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-red/10 text-red">
              <Trash2 className="size-6" />
            </span>
            <h2 className="mt-4 text-center text-xl font-bold text-navy">
              Delete Assignment?
            </h2>
            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <b className="text-navy">{deleting.title}</b>? This action cannot
              be undone.
            </p>
            <div className="mt-5 grid gap-2 min-[380px]:grid-cols-2 sm:mt-6 sm:gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={remove} className="btn-primary bg-red">
                Delete Assignment
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .row-action {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
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
function Page({
  children,
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs disabled:opacity-40"
    >
      {children}
    </button>
  );
}
