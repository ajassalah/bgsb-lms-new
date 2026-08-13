"use client";
import {
  Edit3,
  Eye,
  Mail,
  MessageCircle,
  MoreVertical,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";
import { BulkImportDialog } from "./bulk-import-dialog";
import { useIsStaffPortal, useStaffCan } from "./staff-permission-context";
import { TablePagination } from "./table-pagination";
export type StudentRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  status: string;
  avatar_url: string | null;
  enrolledCount: number;
  whatsapp_number: string | null;
  verification_status: "pending" | "verified" | "declined";
  verified_as: string | null;
  verified_at: string | null;
};
export function StudentManagement({
  initialStudents,
  emailTemplates,
  fromEmail,
}: {
  initialStudents: StudentRow[];
  emailTemplates: { id: string; subject: string }[];
  fromEmail: string;
}) {
  const isStaff = useIsStaffPortal(),
    basePath = isStaff
      ? "/dashboard/admin-staff/students"
      : "/dashboard/super-admin/students";
  const canBulk = useStaffCan("students", "bulk_import"),
    canCreate = useStaffCan("students", "create"),
    canEdit = useStaffCan("students", "edit"),
    canView = useStaffCan("students", "view"),
    canVerify = useStaffCan("students", "verification"),
    canDelete = useStaffCan("students", "delete"),
    canEmail = useStaffCan("students", "send_email"),
    canWhatsapp = useStaffCan("students", "whatsapp"),
    canStatus = useStaffCan("students", "status");
  const [rows, setRows] = useState(initialStudents),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [menu, setMenu] = useState<string | null>(null),
    [deleting, setDeleting] = useState<StudentRow | null>(null),
    [emailing, setEmailing] = useState<StudentRow | null>(null),
    [sending, setSending] = useState(false),
    [verifying, setVerifying] = useState<StudentRow | null>(null),
    [verifyBusy, setVerifyBusy] = useState(false),
    router = useRouter(),
    filteredStudents = useMemo(
      () =>
        rows.filter((x) =>
          `${x.full_name} ${x.email} ${x.phone || ""} ${x.country || ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
      [rows, query],
    ),
    pages = Math.max(1, Math.ceil(filteredStudents.length / 20)),
    students = filteredStudents.slice((page - 1) * 20, page * 20);
  useEffect(() => setRows(initialStudents), [initialStudents]);
  async function sendEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!emailing) return;
    setSending(true);
    const template_id = String(
      new FormData(event.currentTarget).get("template_id") || "",
    );
    const res = await fetch("/api/admin/send-student-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ student_id: emailing.id, template_id }),
    });
    setSending(false);
    if (res.ok) {
      toast.success("Email sent successfully");
      setEmailing(null);
    } else toast.error((await res.json()).error || "Email failed");
  }
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
    } else {
      toast.success("Student status updated");
      router.refresh();
    }
  }
  async function verifyStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!verifying) return;
    setVerifyBusy(true);
    const action = String(
      new FormData(event.currentTarget).get("action") || "",
    );
    const res = await fetch(`/api/admin/students/${verifying.id}/verify`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const body = await res.json().catch(() => ({}));
    setVerifyBusy(false);
    if (!res.ok) return toast.error(body.error || "Verification failed");
    setRows((current) =>
      current.map((student) =>
        student.id === verifying.id
          ? {
              ...student,
              verification_status: body.verification_status,
              verified_as: null,
              verified_at: body.verified_at,
            }
          : student,
      ),
    );
    setVerifying(null);
    toast.success(
      body.verification_status === "verified"
        ? "Student verified and login credentials emailed"
        : "Student verification declined",
    );
    router.refresh();
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
        <div className="flex flex-wrap gap-2">
          {canBulk && (
            <BulkImportDialog
              label="Students"
              endpoint="/api/admin/bulk/students"
              template={`first_name,last_name,email,phone_country_code,phone,whatsapp_number,country,address,date_of_birth,gender,nic_passport\nJane,Doe,jane@example.com,+94,771234567,+94771234567,Sri Lanka,Colombo,2000-01-15,female,N1234567`}
            />
          )}
          {canCreate && (
            <button
              onClick={() => router.push(`${basePath}/new`)}
              className="btn-primary gap-2"
            >
              <Plus className="size-4" />
              Add Student
            </button>
          )}
        </div>
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
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Name & Mail</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Country</th>
                <th className="p-4">Enrolled Course</th>
                <th className="p-4">Verification</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((s, i) => (
                <tr key={s.id}>
                  <td className="p-4 text-slate-400">
                    {(page - 1) * 20 + i + 1}
                  </td>
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
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        s.verification_status === "verified"
                          ? "bg-emerald-50 text-emerald-700"
                          : s.verification_status === "declined"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {s.verification_status === "verified"
                        ? "Verified"
                        : s.verification_status === "declined"
                          ? "Declined"
                          : "Pending"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {canStatus && (
                        <button
                          onClick={() => status(s)}
                          className={`relative h-6 w-11 rounded-full ${s.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`}
                        >
                          <span
                            className={`absolute top-1 size-4 rounded-full bg-white transition ${s.status === "active" ? "left-6" : "left-1"}`}
                          />
                        </button>
                      )}
                      <small className="capitalize">{s.status}</small>
                    </div>
                  </td>
                  <td className="relative p-4">
                    {(canView ||
                      canEdit ||
                      canVerify ||
                      canDelete ||
                      canEmail ||
                      canWhatsapp) && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => setMenu(menu === s.id ? null : s.id)}
                          className="grid size-9 place-items-center rounded-lg border"
                        >
                          <MoreVertical className="size-4" />
                        </button>
                      </div>
                    )}
                    {menu === s.id && (
                      <div className="absolute right-4 top-14 z-[190] w-48 rounded-xl border bg-white py-1 shadow-2xl">
                        {canView && (
                          <button
                            onClick={() => router.push(`${basePath}/${s.id}`)}
                            className="student-action"
                          >
                            <Eye />
                            View
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() =>
                              router.push(`${basePath}/${s.id}/edit`)
                            }
                            className="student-action"
                          >
                            <Edit3 />
                            Edit
                          </button>
                        )}
                        {canVerify && (
                          <button
                            onClick={() => {
                              setVerifying(s);
                              setMenu(null);
                            }}
                            className="student-action"
                          >
                            <ShieldCheck />
                            Verification
                          </button>
                        )}
                        {canDelete && (
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
                        )}
                        {canEmail && (
                          <button
                            onClick={() => {
                              setEmailing(s);
                              setMenu(null);
                            }}
                            className="student-action"
                          >
                            <Mail />
                            Send Email
                          </button>
                        )}
                        {canWhatsapp && s.whatsapp_number && (
                          <a
                            href={`https://wa.me/${s.whatsapp_number.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="student-action text-emerald-600"
                          >
                            <MessageCircle />
                            WhatsApp
                          </a>
                        )}
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
      <ConfirmDialog
        open={!!deleting}
        title="Delete Student?"
        description={`Delete ${deleting?.full_name || "this student"} and their related learning records? This cannot be undone.`}
        confirmLabel="Delete Student"
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
      {emailing && (
        <div className="fixed inset-0 z-[220] grid place-items-center bg-black/50 p-3 backdrop-blur-sm">
          <form
            onSubmit={sendEmail}
            className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setEmailing(null)}
              className="absolute right-3 top-3 grid size-9 place-items-center"
            >
              <X className="size-4" />
            </button>
            <h2 className="text-lg font-bold text-navy">Send Email</h2>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-semibold">
                From
                <input
                  value={fromEmail}
                  readOnly
                  className="field mt-2 bg-slate-50"
                />
              </label>
              <label className="block text-sm font-semibold">
                To
                <input
                  value={emailing.email}
                  readOnly
                  className="field mt-2 bg-slate-50"
                />
              </label>
              <label className="block text-sm font-semibold">
                Subject
                <select name="template_id" required className="field mt-2">
                  <option value="">Select email template</option>
                  {emailTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.subject}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEmailing(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button disabled={sending} className="btn-primary">
                {sending ? "Sending…" : "Send Email"}
              </button>
            </div>
          </form>
        </div>
      )}
      {verifying && (
        <div className="fixed inset-0 z-[225] grid place-items-center bg-black/50 p-3 backdrop-blur-sm">
          <form
            onSubmit={verifyStudent}
            className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setVerifying(null)}
              className="absolute right-3 top-3 grid size-9 place-items-center"
            >
              <X className="size-4" />
            </button>
            <div className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
              <ShieldCheck className="size-5" />
            </div>
            <h2 className="mt-3 text-lg font-bold text-navy">Verify Student</h2>
            <p className="mt-1 text-sm text-slate-500">{verifying.full_name}</p>
            <label className="mt-5 block text-sm font-semibold">
              Decision
              <select name="action" required className="field mt-2">
                <option value="">Select decision</option>
                <option value="verify">Verify</option>
                <option value="decline">Decline</option>
              </select>
            </label>
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              Verify creates a temporary password and emails the login URL,
              username, and password to {verifying.email}. Decline does not send
              login credentials.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setVerifying(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button disabled={verifyBusy} className="btn-primary">
                {verifyBusy ? "Saving…" : "Submit Decision"}
              </button>
            </div>
          </form>
        </div>
      )}
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
