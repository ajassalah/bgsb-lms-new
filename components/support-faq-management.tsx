"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useIsStaffPortal } from "./staff-permission-context";

export type FaqRow = {
  id: string;
  question: string;
  answer: string;
  status: "active" | "inactive";
};
export function SupportFaqManagement({
  initialRows,
}: {
  initialRows: FaqRow[];
}) {
  const isStaff = useIsStaffPortal(),
    basePath = isStaff
      ? "/dashboard/admin-staff/support/faq"
      : "/dashboard/super-admin/support/faq";
  const [rows, setRows] = useState(initialRows),
    [page, setPage] = useState(1),
    [menu, setMenu] = useState<string | null>(null),
    [deleting, setDeleting] = useState<FaqRow | null>(null),
    router = useRouter(),
    pages = Math.max(1, Math.ceil(rows.length / 20)),
    visible = useMemo(
      () => rows.slice((page - 1) * 20, page * 20),
      [rows, page],
    );
  useEffect(() => setRows(initialRows), [initialRows]);
  async function toggle(row: FaqRow) {
    const status = row.status === "active" ? "inactive" : "active";
    setRows((current) =>
      current.map((item) => (item.id === row.id ? { ...item, status } : item)),
    );
    const res = await fetch(`/api/admin/support-faqs/${row.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setRows((current) =>
        current.map((item) => (item.id === row.id ? row : item)),
      );
      toast.error("FAQ status update failed");
    } else {
      toast.success("FAQ status updated");
      router.refresh();
    }
  }
  async function remove() {
    if (!deleting) return;
    const res = await fetch(`/api/admin/support-faqs/${deleting.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setRows((current) => current.filter((item) => item.id !== deleting.id));
      setDeleting(null);
      toast.success("FAQ deleted");
    } else toast.error("FAQ deletion failed");
  }
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Communication / Support</p>
          <h1 className="mt-1 text-2xl font-bold text-navy">FAQ</h1>
        </div>
        <button
          onClick={() => router.push(`${basePath}/new`)}
          className="btn-primary gap-2"
        >
          <Plus className="size-4" />
          Add FAQ
        </button>
      </div>
      <section className="mt-7 rounded-xl border bg-white">
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Question</th>
                <th className="p-4">Answer</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((row, index) => (
                <tr key={row.id}>
                  <td className="p-4">{(page - 1) * 10 + index + 1}</td>
                  <td className="max-w-xs p-4 font-semibold text-navy">
                    {row.question}
                  </td>
                  <td className="max-w-md p-4">
                    <div
                      className="line-clamp-3 text-slate-500"
                      dangerouslySetInnerHTML={{ __html: row.answer }}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggle(row)}
                        className={`relative h-6 w-11 rounded-full ${row.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`}
                      >
                        <span
                          className={`absolute top-1 size-4 rounded-full bg-white transition ${row.status === "active" ? "left-6" : "left-1"}`}
                        />
                      </button>
                      <small className="capitalize">{row.status}</small>
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
                        <button
                          onClick={() =>
                            router.push(`${basePath}/${row.id}/edit`)
                          }
                          className="faq-action"
                        >
                          <Edit3 />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeleting(row);
                            setMenu(null);
                          }}
                          className="faq-action text-red"
                        >
                          <Trash2 />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    No FAQs created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t p-4">
          {page > 1 && (
            <button
              onClick={() => setPage((current) => current - 1)}
              className="btn-secondary gap-1 px-3 py-2 text-xs disabled:hidden"
            >
              <ChevronLeft className="size-4" />
              Previous
            </button>
          )}
          {Array.from({ length: pages }, (_, index) => index + 1).map(
            (number) => (
              <button
                key={number}
                onClick={() => setPage(number)}
                className={`grid size-9 place-items-center rounded-lg text-sm font-semibold ${page === number ? "bg-navy text-white" : "border bg-white"}`}
              >
                {number}
              </button>
            ),
          )}
          {page < pages && (
            <button
              onClick={() => setPage((current) => current + 1)}
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
        title="Delete FAQ?"
        description={`Delete “${deleting?.question || "this FAQ"}”? This cannot be undone.`}
        confirmLabel="Delete FAQ"
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
      <style jsx global>{`
        .faq-action {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 0.5rem;
          border-radius: 0.5rem;
          padding: 0.65rem 0.75rem;
          font-size: 0.8rem;
        }
        .faq-action:hover {
          background: #f8fafc;
        }
        .faq-action svg {
          width: 1rem;
          height: 1rem;
        }
      `}</style>
    </>
  );
}
