"use client";
import { Edit3, Eye, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
export type StudentRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  status: string;
  avatar_url: string | null;
  enrolledCount: number;
};
export function StudentManagement({
  initialStudents,
}: {
  initialStudents: StudentRow[];
}) {
  const [rows, setRows] = useState(initialStudents),
    [query, setQuery] = useState(""),
    [menu, setMenu] = useState<string | null>(null),
    [deleting, setDeleting] = useState<StudentRow | null>(null),
    router = useRouter(),
    students = useMemo(
      () =>
        rows.filter((x) =>
          `${x.full_name} ${x.email} ${x.phone || ""} ${x.country || ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
      [rows, query],
    );
  async function status(student: StudentRow) {
    const next = student.status === "active" ? "suspended" : "active";
    setRows((x) =>
      x.map((y) => (y.id === student.id ? { ...y, status: next } : y)),
    );
    const res = await fetch(`/api/admin/students/${student.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      setRows((x) => x.map((y) => (y.id === student.id ? student : y)));
      toast.error("Status update failed");
    }
  }
  async function remove() {
    if (!deleting) return;
    const res = await fetch(`/api/admin/students/${deleting.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setRows((x) => x.filter((y) => y.id !== deleting.id));
      setDeleting(null);
      toast.success("Student deleted");
    } else
      toast.error(
        (await res.json().catch(() => ({}))).error || "Delete failed",
      );
  }
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">People / Manage Students</p>
          <h1 className="mt-1 text-2xl font-bold text-navy">Manage Students</h1>
        </div>
        <button
          onClick={() => router.push("/dashboard/super-admin/students/new")}
          className="btn-primary gap-2"
        >
          <Plus className="size-4" />
          Add Student
        </button>
      </div>
      <section className="mt-7 overflow-visible rounded-xl border bg-white">
        <div className="border-b p-5">
          <label className="relative block max-w-lg">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="field pl-10"
              placeholder="Search students..."
            />
          </label>
        </div>
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Name & Mail</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Country</th>
                <th className="p-4">Enrolled Course</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((s, i) => (
                <tr key={s.id}>
                  <td className="p-4 text-slate-400">{i + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {s.avatar_url ? (
                        <img
                          src={s.avatar_url}
                          alt=""
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="grid size-10 place-items-center rounded-full bg-navy font-bold text-white">
                          {s.full_name[0]}
                        </span>
                      )}
                      <span>
                        <b className="block text-navy">{s.full_name}</b>
                        <small className="text-slate-400">{s.email}</small>
                      </span>
                    </div>
                  </td>
                  <td className="p-4">{s.phone || "—"}</td>
                  <td className="p-4">{s.country || "—"}</td>
                  <td className="p-4">
                    <span className="rounded-lg bg-blue-50 px-3 py-1.5 font-bold text-blue-700">
                      {s.enrolledCount}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => status(s)}
                        className={`relative h-6 w-11 rounded-full ${s.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`}
                      >
                        <span
                          className={`absolute top-1 size-4 rounded-full bg-white transition ${s.status === "active" ? "left-6" : "left-1"}`}
                        />
                      </button>
                      <small className="capitalize">{s.status}</small>
                    </div>
                  </td>
                  <td className="relative p-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setMenu(menu === s.id ? null : s.id)}
                        className="grid size-9 place-items-center rounded-lg border"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </div>
                    {menu === s.id && (
                      <div className="absolute right-4 top-14 z-50 w-40 rounded-xl border bg-white py-1 shadow-xl">
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/super-admin/students/${s.id}`,
                            )
                          }
                          className="student-action"
                        >
                          <Eye />
                          View
                        </button>
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/super-admin/students/${s.id}/edit`,
                            )
                          }
                          className="student-action"
                        >
                          <Edit3 />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeleting(s);
                            setMenu(null);
                          }}
                          className="student-action text-red"
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
      </section>
      <ConfirmDialog
        open={!!deleting}
        title="Delete Student?"
        description={`Delete ${deleting?.full_name || "this student"} and their related learning records? This cannot be undone.`}
        confirmLabel="Delete Student"
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
      <style jsx global>{`
        .student-action {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1rem;
          font-size: 0.875rem;
        }
        .student-action:hover {
          background: #f8fafc;
        }
        .student-action svg {
          width: 1rem;
          height: 1rem;
        }
      `}</style>
    </>
  );
}
