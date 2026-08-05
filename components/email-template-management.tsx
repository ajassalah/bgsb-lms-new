"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, MoreVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
export function EmailTemplateManagement({
  initialRows,
}: {
  initialRows: { id: string; subject: string }[];
}) {
  const [rows, setRows] = useState(initialRows),
    [menu, setMenu] = useState<string | null>(null),
    [del, setDel] = useState<{ id: string; subject: string } | null>(null),
    router = useRouter();
  async function remove() {
    if (!del) return;
    const res = await fetch(`/api/admin/email-templates/${del.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setRows((x) => x.filter((y) => y.id !== del.id));
      setDel(null);
      toast.success("Template deleted");
    } else toast.error("Delete failed");
  }
  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Communication</p>
          <h1 className="mt-1 text-2xl font-bold text-navy">Email Templates</h1>
        </div>
        <button
          onClick={() =>
            router.push("/dashboard/super-admin/email-templates/new")
          }
          className="btn-primary gap-2"
        >
          <Plus className="size-4" />
          Add Template
        </button>
      </div>
      <section className="mt-7 overflow-visible rounded-2xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td className="px-6 py-4">{i + 1}</td>
                <td className="px-6 py-4 font-semibold text-navy">
                  {r.subject}
                </td>
                <td className="relative px-6 py-4 text-right">
                  <button onClick={() => setMenu(menu === r.id ? null : r.id)}>
                    <MoreVertical className="size-5" />
                  </button>
                  {menu === r.id && (
                    <div className="absolute right-6 top-12 z-50 w-36 rounded-xl border bg-white p-2 text-left shadow-xl">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/super-admin/email-templates/${r.id}/edit`,
                          )
                        }
                        className="flex w-full gap-2 rounded-lg px-3 py-2 hover:bg-slate-50"
                      >
                        <Edit3 className="size-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setDel(r);
                          setMenu(null);
                        }}
                        className="flex w-full gap-2 rounded-lg px-3 py-2 text-red hover:bg-red/10"
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
      </section>
      <ConfirmDialog
        open={!!del}
        title="Delete template?"
        description={`Delete ${del?.subject || "this template"}?`}
        onCancel={() => setDel(null)}
        onConfirm={remove}
      />
    </>
  );
}
