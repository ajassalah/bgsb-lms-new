"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronDown,
  Eye,
  MoreVertical,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
import { TablePagination } from "./table-pagination";
import { useStaffCan } from "./staff-permission-context";

export type IntakeRow = {
  id: string;
  ref_no: string;
  name: string;
  type: string;
  year: number;
  status: string;
  created_at: string;
};
export type BatchRow = {
  id: string;
  ref_no: string;
  batch_name: string;
  course: string;
  intake: string;
  start_date: string;
  end_date: string;
  status: string;
  learners: number;
};
type Kind = "intakes" | "batches";
export function IntakeBatchManagement({
  kind,
  initialRows,
  basePath,
}: {
  kind: Kind;
  initialRows: (IntakeRow | BatchRow)[];
  basePath: string;
}) {
  const [rows, setRows] = useState(initialRows),
    [page, setPage] = useState(1),
    [menu, setMenu] = useState<string | null>(null),
    [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 }),
    [deleting, setDeleting] = useState<IntakeRow | BatchRow | null>(null),
    [verify, setVerify] = useState<BatchRow | null>(null);
  const canCreate = useStaffCan(kind, "create"),
    canView = useStaffCan(kind, "view"),
    canEdit = useStaffCan(kind, "edit"),
    canDelete = useStaffCan(kind, "delete"),
    canStatus = useStaffCan(kind, "verify");
  const pages = Math.max(1, Math.ceil(rows.length / 20)),
    visible = rows.slice((page - 1) * 20, page * 20),
    menuRow = rows.find((row) => row.id === menu);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest("[data-intake-batch-trigger]") ||
        target?.closest("[data-intake-batch-menu]")
      )
        return;
      setMenu(null);
    };
    document.addEventListener("pointerdown", close, true);
    return () => document.removeEventListener("pointerdown", close, true);
  }, []);
  async function remove() {
    if (!deleting) return;
    const res = await fetch(`/api/admin/${kind}/${deleting.id}`, {
      method: "DELETE",
    });
    if (!res.ok) return toast.error("Delete failed");
    setRows((x) => x.filter((y) => y.id !== deleting.id));
    setDeleting(null);
    toast.success(kind === "intakes" ? "Intake deleted" : "Batch deleted");
  }
  async function updateStatus(status: string) {
    if (!verify) return;
    const res = await fetch(`/api/admin/batches/${verify.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return toast.error("Status update failed");
    setRows((x) => x.map((y) => (y.id === verify.id ? { ...y, status } : y)));
    setVerify(null);
    toast.success("Batch status updated");
  }
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Academic</p>
          <h1 className="mt-1 text-2xl font-bold text-navy">
            {kind === "intakes" ? "Intakes" : "Batches"}
          </h1>
        </div>
        {canCreate && (
          <Link className="btn-primary gap-2" href={`${basePath}/new`}>
            <Plus className="size-4" />
            Create {kind === "intakes" ? "Intake" : "Batch"}
          </Link>
        )}
      </div>
      <section className="mt-6 overflow-visible rounded-2xl border bg-white">
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                {kind === "intakes" && <th className="px-5 py-4">#</th>}
                <th className="px-5 py-4">Ref No</th>
                <th className="px-5 py-4">
                  {kind === "intakes" ? "Name" : "Course"}
                </th>
                {kind === "batches" && (
                  <th className="px-5 py-4">Batch Name</th>
                )}
                {kind === "batches" && <th className="px-5 py-4">Intake</th>}{" "}
                {kind === "intakes" ? (
                  <>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4">Year</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Created</th>
                  </>
                ) : (
                  <>
                    <th className="px-5 py-4">Start Date</th>
                    <th className="px-5 py-4">End Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Learners</th>
                  </>
                )}
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((row, i) => (
                <tr key={row.id}>
                  {kind === "intakes" && (
                    <td className="px-5 py-4 text-slate-400">
                      {(page - 1) * 20 + i + 1}
                    </td>
                  )}
                  <td className="px-5 py-4 font-bold text-navy">
                    {row.ref_no}
                  </td>
                  <td className="px-5 py-4">
                    {kind === "intakes"
                      ? (row as IntakeRow).name
                      : (row as BatchRow).course}
                  </td>
                  {kind === "batches" && (
                    <td className="px-5 py-4 font-semibold text-navy">
                      {(row as BatchRow).batch_name}
                    </td>
                  )}
                  {kind === "batches" && (
                    <td className="px-5 py-4">{(row as BatchRow).intake}</td>
                  )}
                  {kind === "intakes" ? (
                    <>
                      <td className="px-5 py-4 capitalize">
                        {(row as IntakeRow).type}
                      </td>
                      <td className="px-5 py-4">{(row as IntakeRow).year}</td>
                      <Status value={row.status} />
                      <td className="px-5 py-4">
                        {new Date(
                          (row as IntakeRow).created_at,
                        ).toLocaleDateString()}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-4">
                        {(row as BatchRow).start_date}
                      </td>
                      <td className="px-5 py-4">
                        {(row as BatchRow).end_date}
                      </td>
                      <Status value={row.status} />
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2">
                          <Users className="size-4 text-red" />
                          {(row as BatchRow).learners}
                        </span>
                      </td>
                    </>
                  )}
                  <td className="relative px-5 py-4">
                    <button
                      type="button"
                      data-intake-batch-trigger
                      onClick={(e) => {
                        e.stopPropagation();
                        if (menu === row.id) return setMenu(null);
                        const rect = e.currentTarget.getBoundingClientRect();
                        const width = 176;
                        setMenuPosition({
                          top:
                            rect.bottom + 190 > window.innerHeight
                              ? Math.max(8, rect.top - 174)
                              : rect.bottom + 6,
                          left: Math.max(
                            8,
                            Math.min(
                              rect.right - width,
                              window.innerWidth - width - 8,
                            ),
                          ),
                        });
                        setMenu(row.id);
                      }}
                      className="grid size-9 place-items-center rounded-lg border"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination page={page} total={pages} onChange={setPage} />
      </section>
      {menuRow &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            data-intake-batch-menu
            onClick={(event) => event.stopPropagation()}
            style={{ top: menuPosition.top, left: menuPosition.left }}
            className="lms-dropdown-menu fixed z-[10000] w-44 rounded-xl p-1 text-sm"
          >
            {canView && (
              <Action
                href={`${basePath}/${menuRow.id}`}
                icon={Eye}
                label="View"
              />
            )}
            {canEdit && (
              <Action
                href={`${basePath}/${menuRow.id}/edit`}
                icon={Pencil}
                label="Edit"
              />
            )}
            {kind === "batches" && canStatus && (
              <button
                onClick={() => {
                  setVerify(menuRow as BatchRow);
                  setMenu(null);
                }}
                className="batch-verify-action flex w-full items-center gap-2 rounded-lg px-3 py-2"
              >
                <ShieldCheck className="size-4 text-emerald-600" />
                Verify
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => {
                  setDeleting(menuRow);
                  setMenu(null);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red hover:bg-red/5"
              >
                <Trash2 className="size-4" />
                Delete
              </button>
            )}
          </div>,
          document.body,
        )}
      <ConfirmDialog
        open={!!deleting}
        title={`Delete ${kind === "intakes" ? "Intake" : "Batch"}?`}
        description="This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
      {verify && (
        <VerifyModal
          item={verify}
          close={() => setVerify(null)}
          save={updateStatus}
        />
      )}
    </>
  );
}
function Status({ value }: { value: string }) {
  return (
    <td className="px-5 py-4">
      <span
        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${value === "active" ? "bg-emerald-50 text-emerald-700" : value === "draft" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"}`}
      >
        {value}
      </span>
    </td>
  );
}
function Action({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Eye;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-slate-50"
    >
      <Icon className="size-4 text-blue-600" />
      {label}
    </Link>
  );
}
function VerifyModal({
  item,
  close,
  save,
}: {
  item: BatchRow;
  close: () => void;
  save: (x: string) => void;
}) {
  const [value, setValue] = useState(item.status),
    [open, setOpen] = useState(false);
  const statuses = [
    { value: "active", label: "Active", dot: "bg-emerald-500" },
    { value: "inactive", label: "Inactive", dot: "bg-slate-400" },
    { value: "draft", label: "Draft", dot: "bg-amber-500" },
  ];
  const selected = statuses.find((status) => status.value === value)!;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[220] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"
    >
      <div className="batch-verify-modal lms-popup-card w-full max-w-sm rounded-2xl p-5">
        <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
          <ShieldCheck className="size-5" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-navy">Verify Batch</h2>
        <p className="mt-1 text-sm text-slate-500">
          {item.ref_no} · {item.batch_name}
        </p>
        <div className="relative mt-5">
          <label className="mb-2 block text-sm font-bold text-navy">
            Status
          </label>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className={`batch-verify-trigger flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold shadow-sm transition ${open ? "!border-red ring-2 ring-red/10" : ""}`}
          >
            <span className="flex items-center gap-3">
              <span className={`size-2.5 rounded-full ${selected.dot}`} />
              {selected.label}
            </span>
            <ChevronDown
              className={`size-4 text-slate-400 transition ${open ? "rotate-180" : ""}`}
            />
          </button>
          {open && (
            <div className="batch-verify-options lms-dropdown-menu absolute z-20 mt-2 w-full overflow-hidden rounded-xl border p-1.5">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => {
                    setValue(status.value);
                    setOpen(false);
                  }}
                  className={`batch-verify-option flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${value === status.value ? "bg-red/5 font-bold !text-red" : ""}`}
                >
                  <span className={`size-2.5 rounded-full ${status.dot}`} />
                  <span className="flex-1">{status.label}</span>
                  {value === status.value && <Check className="size-4" />}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded-lg border px-4 py-2" onClick={close}>
            Cancel
          </button>
          <button className="btn-primary" onClick={() => save(value)}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
