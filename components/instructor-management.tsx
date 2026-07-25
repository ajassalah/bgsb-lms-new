"use client";
import { Edit3, Eye, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
export type InstructorRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  last_login_at: string | null;
  status: string;
  avatar_url: string | null;
};
export function InstructorManagement({
  initialRows,
  entity = "Instructor",
  basePath = "/dashboard/super-admin/instructors",
  profileRole = "instructor",
}: {
  initialRows: InstructorRow[];
  entity?: "Instructor" | "Staff";
  basePath?: string;
  profileRole?: "instructor" | "admin_staff";
}) {
  const [rows, setRows] = useState(initialRows),
    [query, setQuery] = useState(""),
    [menu, setMenu] = useState<string | null>(null),
    [deleting, setDeleting] = useState<InstructorRow | null>(null),
    router = useRouter(),
    visible = useMemo(
      () =>
        rows.filter((x) =>
          `${x.full_name} ${x.email}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
      [rows, query],
    );
  async function toggle(row: InstructorRow) {
    const status = row.status === "active" ? "suspended" : "active";
    setRows((x) => x.map((y) => (y.id === row.id ? { ...y, status } : y)));
    const res = await fetch(
      `/api/admin/instructors/${row.id}?role=${profileRole}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    if (!res.ok) {
      setRows((x) => x.map((y) => (y.id === row.id ? row : y)));
      toast.error("Status update failed");
    }
  }
  async function remove() {
    if (!deleting) return;
    const res = await fetch(
      `/api/admin/instructors/${deleting.id}?role=${profileRole}`,
      {
        method: "DELETE",
      },
    );
    if (res.ok) {
      setRows((x) => x.filter((y) => y.id !== deleting.id));
      setDeleting(null);
      toast.success(`${entity} deleted`);
    } else toast.error("Delete failed");
  }
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">People / {entity}</p>
          <h1 className="mt-1 text-2xl font-bold text-navy">{entity}</h1>
        </div>
        <button
          onClick={() => router.push(`${basePath}/new`)}
          className="btn-primary gap-2"
        >
          <Plus className="size-4" />
          Add {entity}
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
              placeholder={`Search ${entity.toLowerCase()} name or mail...`}
            />
          </label>
        </div>
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Name & Mail</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Last Login</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((r, i) => (
                <tr key={r.id}>
                  <td className="p-4">{i + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {r.avatar_url ? (
                        <img
                          src={r.avatar_url}
                          alt=""
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="grid size-10 place-items-center rounded-full bg-navy font-bold text-white">
                          {r.full_name[0]}
                        </span>
                      )}
                      <span>
                        <b className="block text-navy">{r.full_name}</b>
                        <small className="text-slate-400">{r.email}</small>
                      </span>
                    </div>
                  </td>
                  <td className="p-4">{r.phone || "—"}</td>
                  <td className="p-4">
                    {r.last_login_at
                      ? new Date(r.last_login_at).toLocaleString("en-GB")
                      : "Never"}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggle(r)}
                        className={`relative h-6 w-11 rounded-full ${r.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`}
                      >
                        <span
                          className={`absolute top-1 size-4 rounded-full bg-white ${r.status === "active" ? "left-6" : "left-1"}`}
                        />
                      </button>
                      <small className="capitalize">{r.status}</small>
                    </div>
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
                      <div className="absolute right-4 top-14 z-50 w-40 rounded-xl border bg-white py-1 shadow-xl">
                        <button
                          onClick={() => router.push(`${basePath}/${r.id}`)}
                          className="instructor-action"
                        >
                          <Eye />
                          View
                        </button>
                        <button
                          onClick={() =>
                            router.push(`${basePath}/${r.id}/edit`)
                          }
                          className="instructor-action"
                        >
                          <Edit3 />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeleting(r);
                            setMenu(null);
                          }}
                          className="instructor-action text-red"
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
        title={`Delete ${entity}?`}
        description={`Delete ${deleting?.full_name || `this ${entity.toLowerCase()}`}? Assigned live classes will be unassigned.`}
        confirmLabel={`Delete ${entity}`}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
      <style jsx global>{`
        .instructor-action {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1rem;
          font-size: 0.875rem;
        }
        .instructor-action:hover {
          background: #f8fafc;
        }
        .instructor-action svg {
          width: 1rem;
          height: 1rem;
        }
      `}</style>
    </>
  );
}
