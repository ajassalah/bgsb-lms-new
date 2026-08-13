"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
export type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  receivers: string[];
};
export function AnnouncementManagement({
  initialRows,
}: {
  initialRows: AnnouncementRow[];
}) {
  const [rows, setRows] = useState(initialRows),
    [page, setPage] = useState(1),
    [menu, setMenu] = useState<string | null>(null),
    [deleting, setDeleting] = useState<AnnouncementRow | null>(null),
    router = useRouter(),
    pages = Math.max(1, Math.ceil(rows.length / 20)),
    visible = rows.slice((page - 1) * 20, page * 20);
  async function remove() {
    if (!deleting) return;
    const res = await fetch(`/api/admin/announcements/${deleting.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setRows((x) => x.filter((y) => y.id !== deleting.id));
      setDeleting(null);
      toast.success("Announcement deleted");
    } else toast.error("Delete failed");
  }
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">
            Communication / Announcements
          </p>
          <h1 className="mt-1 text-2xl font-bold text-navy">Announcements</h1>
        </div>
        <button
          onClick={() =>
            router.push("/dashboard/super-admin/announcements/new")
          }
          className="btn-primary gap-2"
        >
          <Plus className="size-4" />
          Create Announcement
        </button>
      </div>
      <section className="mt-7 rounded-xl border bg-white">
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                {["#", "Title", "Description", "Receiver", "Action"].map(
                  (x) => (
                    <th className="p-4" key={x}>
                      {x}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((row, i) => (
                <tr key={row.id}>
                  <td className="p-4">{(page - 1) * 10 + i + 1}</td>
                  <td className="p-4 font-semibold text-navy">{row.title}</td>
                  <td className="max-w-md p-4">
                    <div
                      className="line-clamp-2 text-slate-500"
                      dangerouslySetInnerHTML={{ __html: row.body }}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {row.receivers.map((x) => (
                        <span
                          key={x}
                          className="rounded-full bg-blue-50 px-2 py-1 text-xs capitalize text-blue-700"
                        >
                          {x.replaceAll("_", " ")}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="relative p-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setMenu(menu === row.id ? null : row.id)}
                        className="grid size-9 place-items-center rounded-lg border"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </div>
                    {menu === row.id && (
                      <div className="absolute right-4 top-14 z-[180] w-40 rounded-xl border bg-white p-1 shadow-2xl">
                        <Action
                          icon={Eye}
                          text="View"
                          click={() =>
                            router.push(
                              `/dashboard/super-admin/announcements/${row.id}`,
                            )
                          }
                        />
                        <Action
                          icon={Edit3}
                          text="Edit"
                          click={() =>
                            router.push(
                              `/dashboard/super-admin/announcements/${row.id}/edit`,
                            )
                          }
                        />
                        <Action
                          icon={Trash2}
                          text="Delete"
                          red
                          click={() => {
                            setDeleting(row);
                            setMenu(null);
                          }}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    No announcements created.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t p-4">
          {page > 1 && (
            <button
              onClick={() => setPage((x) => x - 1)}
              className="btn-secondary gap-1 px-3 py-2 text-xs disabled:hidden"
            >
              <ChevronLeft className="size-4" />
              Previous
            </button>
          )}
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`grid size-9 place-items-center rounded-lg text-sm font-semibold ${page === n ? "bg-navy text-white" : "border bg-white"}`}
            >
              {n}
            </button>
          ))}
          {page < pages && (
            <button
              onClick={() => setPage((x) => x + 1)}
              className="btn-secondary gap-1 px-3 py-2 text-xs disabled:hidden"
            >
              Next
              <ChevronRight className="size-4" />
            </button>
          )}
        </div>
      </section>
      <ConfirmDialog
        open={!!deleting}
        title="Delete Announcement?"
        description={`Delete ${deleting?.title || "this announcement"}?`}
        confirmLabel="Delete"
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </>
  );
}
function Action({
  icon: Icon,
  text,
  click,
  red = false,
}: {
  icon: any;
  text: string;
  click: () => void;
  red?: boolean;
}) {
  return (
    <button
      onClick={click}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50 ${red ? "text-red" : ""}`}
    >
      <Icon className="size-4" />
      {text}
    </button>
  );
}
