"use client";
import { useState } from "react";
import {
  Award,
  Download,
  MoreVertical,
  Plus,
  Trash2,
  Upload,
  X,
  Users,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
import { TablePagination } from "./table-pagination";
export type CertificateCourse = {
  courseId: string;
  course: string;
  organization: string;
  instructor: string;
  templateId: string | null;
  title: string | null;
  url: string | null;
  addedAt: string | null;
};
export function CertificateManagement({
  initialRows,
}: {
  initialRows: CertificateCourse[];
}) {
  const [rows, setRows] = useState(initialRows),
    [page, setPage] = useState(1),
    [menu, setMenu] = useState<string | null>(null),
    [selected, setSelected] = useState<CertificateCourse | null>(null),
    [deleting, setDeleting] = useState<CertificateCourse | null>(null),
    pages = Math.max(1, Math.ceil(rows.length / 20)),
    visible = rows.slice((page - 1) * 20, page * 20);
  async function remove(row: CertificateCourse) {
    setMenu(null);
    if (!row.templateId) return;
    const res = await fetch(
      `/api/admin/certificate-templates/${row.templateId}`,
      { method: "DELETE" },
    );
    if (res.ok) {
      setRows((x) =>
        x.map((y) =>
          y.courseId === row.courseId
            ? { ...y, templateId: null, title: null, url: null, addedAt: null }
            : y,
        ),
      );
      setDeleting(null);
      toast.success("Certificate removed");
    } else toast.error("Certificate could not be removed");
  }
  return (
    <>
      <div>
        <p className="text-sm text-slate-400">Courses / Certificates</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">Certificates</h1>
        <p className="mt-2 text-sm text-slate-500">
          Add and manage the certificate template assigned to every course.
        </p>
      </div>
      <section className="mt-7 overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4">#</th>
                <th className="px-5 py-4">Course</th>
                <th className="px-5 py-4">Instructor</th>
                <th className="px-5 py-4">Added Date</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((row, index) => (
                <tr className="hover:bg-slate-50" key={row.courseId}>
                  <td className="px-5 py-4 text-slate-400">
                    {(page - 1) * 20 + index + 1}
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-3">
                      <span
                        className={`grid size-9 place-items-center rounded-lg ${row.templateId ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}
                      >
                        <Award className="size-4" />
                      </span>
                      <span>
                        <b className="block text-navy">{row.course}</b>
                        <small
                          className={
                            row.templateId
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }
                        >
                          {row.templateId
                            ? "Certificate added"
                            : "Not configured"}
                        </small>
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{row.instructor}</td>
                  <td className="px-5 py-4 text-slate-500">
                    {row.addedAt
                      ? new Date(row.addedAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="relative px-5 py-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() =>
                          setMenu(menu === row.courseId ? null : row.courseId)
                        }
                        className="grid size-9 place-items-center rounded-lg border"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </div>
                    {menu === row.courseId && (
                      <div className="absolute right-5 top-14 z-[100] w-52 overflow-hidden rounded-lg border bg-white py-1 shadow-xl">
                        <Link
                          href={`/dashboard/super-admin/certificates/${row.courseId}/students`}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50"
                        >
                          <Users className="size-4 text-violet-600" />
                          Manage Students
                        </Link>
                        {row.templateId ? (
                          <>
                            <button
                              onClick={() => {
                                setSelected(row);
                                setMenu(null);
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50"
                            >
                              <Award className="size-4 text-blue-600" />
                              Manage Certificate
                            </button>
                            {row.url && (
                              <a
                                href={row.url}
                                target="_blank"
                                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50"
                              >
                                <Download className="size-4 text-emerald-600" />
                                View Certificate
                              </a>
                            )}
                            <button
                              onClick={() => {
                                setDeleting(row);
                                setMenu(null);
                              }}
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red hover:bg-red/5"
                            >
                              <Trash2 className="size-4" />
                              Remove Certificate
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setSelected(row);
                              setMenu(null);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50"
                          >
                            <Plus className="size-4 text-red" />
                            Add Certificate
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-slate-400">
                    No courses are available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <TablePagination page={page} total={pages} onChange={setPage} />
      </section>
      <ConfirmDialog
        open={!!deleting}
        title="Remove Certificate?"
        description={`Remove the certificate template from ${deleting?.course || "this course"}?`}
        confirmLabel="Remove Certificate"
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && remove(deleting)}
      />
      {selected && (
        <CertificateModal
          row={selected}
          close={() => setSelected(null)}
          saved={(updated) => {
            setRows((x) =>
              x.map((y) => (y.courseId === updated.courseId ? updated : y)),
            );
            setSelected(null);
          }}
        />
      )}
    </>
  );
}
function CertificateModal({
  row,
  close,
  saved,
}: {
  row: CertificateCourse;
  close: () => void;
  saved: (row: CertificateCourse) => void;
}) {
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    form.set("course_id", row.courseId);
    const res = await fetch("/api/admin/certificate-templates", {
      method: "POST",
      body: form,
    });
    if (res.ok) {
      const data = await res.json();
      saved({ ...row, ...data });
      toast.success(
        row.templateId ? "Certificate updated" : "Certificate added",
      );
    } else {
      const body = await res.json().catch(() => ({}));
      toast.error(body.error || "Certificate could not be saved");
      setBusy(false);
    }
  }
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-slate-950/60 p-3 sm:p-4">
      <form
        onSubmit={submit}
        className="my-auto max-h-[94dvh] w-full max-w-sm overflow-y-auto rounded-xl bg-white p-4 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6"
      >
        <div className="flex justify-between">
          <div>
            <h2 className="text-xl font-bold text-navy">
              {row.templateId ? "Manage Certificate" : "Add Certificate"}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{row.course}</p>
          </div>
          <button type="button" onClick={close}>
            <X />
          </button>
        </div>
        <label className="mt-6 block text-sm font-semibold">
          Certificate title
          <input
            name="title"
            defaultValue={row.title || `${row.course} Certificate`}
            className="field mt-2"
            required
          />
        </label>
        <label className="mt-5 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50 p-5 text-center">
          <Upload className="mb-3 size-7 text-red" />
          <b className="text-sm text-navy">Upload certificate template</b>
          <span className="mt-1 text-xs text-slate-400">
            PDF, JPG, PNG or WebP · maximum 10 MB
          </span>
          <input
            name="file"
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            required={!row.templateId}
            className="mt-4 max-w-full text-xs"
          />
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={close} className="btn-secondary">
            Cancel
          </button>
          <button disabled={busy} className="btn-primary">
            {busy ? "Saving…" : "Save Certificate"}
          </button>
        </div>
      </form>
    </div>
  );
}
