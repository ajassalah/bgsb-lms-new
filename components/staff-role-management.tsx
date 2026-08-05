"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
export type RoleRow = {
  id: string;
  name: string;
  permissions: Record<string, any>;
  count: number;
};
export function StaffRoleManagement({
  initialRows,
}: {
  initialRows: RoleRow[];
}) {
  const [rows, setRows] = useState(initialRows),
    [page, setPage] = useState(1),
    [menu, setMenu] = useState<string | null>(null),
    [del, setDel] = useState<RoleRow | null>(null),
    router = useRouter(),
    pages = Math.max(1, Math.ceil(rows.length / 10)),
    visible = rows.slice((page - 1) * 10, page * 10);
  async function remove() {
    if (!del) return;
    const res = await fetch(`/api/admin/staff-roles/${del.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setRows((x) => x.filter((y) => y.id !== del.id));
      setDel(null);
      toast.success("Role deleted");
    } else toast.error("Delete failed");
  }
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Staff / Roles & Permissions</p>
          <h1 className="mt-1 text-2xl font-bold text-navy">
            Roles & Permissions
          </h1>
        </div>
        <button
          onClick={() => router.push("/dashboard/super-admin/roles/new")}
          className="btn-primary gap-2"
        >
          <Plus className="size-4" />
          Add Role
        </button>
      </div>
      <section className="mt-7 rounded-xl border bg-white">
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Role</th>
                <th className="p-4">Permissions</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((r, i) => (
                <tr key={r.id}>
                  <td className="p-4">{(page - 1) * 10 + i + 1}</td>
                  <td className="p-4 font-semibold text-navy">{r.name}</td>
                  <td className="p-4">{r.count}</td>
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
                      <div className="absolute right-4 top-14 z-[180] w-40 rounded-xl border bg-white p-1 shadow-xl">
                        <button
                          onClick={() =>
                            router.push(
                              `/dashboard/super-admin/roles/${r.id}/edit`,
                            )
                          }
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                        >
                          <Edit3 className="size-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDel(r);
                            setMenu(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red hover:bg-slate-50"
                        >
                          <Trash2 className="size-4" />
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
        <div className="flex justify-end gap-2 border-t p-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((x) => x - 1)}
            className="btn-secondary px-3 py-2"
          >
            <ChevronLeft className="size-4" />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`grid size-9 place-items-center rounded-lg ${page === n ? "bg-navy text-white" : "border"}`}
            >
              {n}
            </button>
          ))}
          <button
            disabled={page === pages}
            onClick={() => setPage((x) => x + 1)}
            className="btn-secondary px-3 py-2"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </section>
      <ConfirmDialog
        open={!!del}
        title="Delete Role?"
        description={`Delete ${del?.name || "this role"}?`}
        onCancel={() => setDel(null)}
        onConfirm={remove}
      />
    </>
  );
}
