"use client";
import { useEffect, useState } from "react";
import { Award, MoreVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "./confirm-dialog";

export type CertificateStudent = { id: string; name: string; email: string; avatar: string | null; certificateId: string | null; issuedAt: string | null };

export function CertificateStudentManagement({ courseId, courseTitle, templateReady, initialStudents }: { courseId: string; courseTitle: string; templateReady: boolean; initialStudents: CertificateStudent[] }) {
  const [students, setStudents] = useState(initialStudents), [menu, setMenu] = useState<string | null>(null), [removing, setRemoving] = useState<CertificateStudent | null>(null), [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { const close = (event: PointerEvent) => { if (!(event.target as HTMLElement).closest("[data-certificate-student-menu]")) setMenu(null); }; document.addEventListener("pointerdown", close); return () => document.removeEventListener("pointerdown", close); }, []);
  async function add(student: CertificateStudent) {
    setMenu(null); setBusy(student.id);
    const res = await fetch(`/api/admin/certificates/${courseId}/students/${student.id}`, { method: "POST" }), body = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return toast.error(body.error || "Certificate could not be added");
    setStudents((rows) => rows.map((row) => row.id === student.id ? { ...row, certificateId: body.id, issuedAt: body.issued_at } : row));
    toast.success(`Certificate added to ${student.name}`);
  }
  async function remove() {
    if (!removing) return; const student = removing; setBusy(student.id);
    const res = await fetch(`/api/admin/certificates/${courseId}/students/${student.id}`, { method: "DELETE" }), body = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return toast.error(body.error || "Certificate could not be removed");
    setStudents((rows) => rows.map((row) => row.id === student.id ? { ...row, certificateId: null, issuedAt: null } : row)); setRemoving(null); toast.success(`Certificate removed from ${student.name}`);
  }
  return <>
    <div><p className="text-sm text-slate-400">Certificates / Manage Students</p><h1 className="mt-1 text-2xl font-bold text-navy">{courseTitle}</h1><p className="mt-2 text-sm text-slate-500">Add or remove certificates for students enrolled in this course.</p></div>
    {!templateReady && <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Add a certificate template to this course before issuing certificates.</div>}
    <section className="mt-7 overflow-visible rounded-xl border bg-white"><div className="divide-y">{students.map((student) => <div key={student.id} className="relative flex items-center gap-4 p-4 sm:p-5" data-certificate-student-menu>
      {student.avatar ? <img src={student.avatar} alt="" className="size-12 rounded-full object-cover" /> : <span className="grid size-12 shrink-0 place-items-center rounded-full bg-slate-100 font-bold text-navy">{student.name.charAt(0)}</span>}
      <div className="min-w-0 flex-1"><b className="block truncate text-navy">{student.name}</b><small className="block truncate text-slate-400">{student.email}</small>{student.certificateId && <small className="mt-1 block font-semibold text-emerald-600">Certificate issued {student.issuedAt ? new Date(student.issuedAt).toLocaleDateString("en-GB") : ""}</small>}</div>
      <button disabled={busy === student.id} onClick={() => setMenu(menu === student.id ? null : student.id)} className="grid size-9 place-items-center rounded-lg border disabled:opacity-50"><MoreVertical className="size-4" /></button>
      {menu === student.id && <div className="absolute right-5 top-14 z-[100] w-52 rounded-xl border bg-white py-1 shadow-2xl">{student.certificateId ? <button onClick={() => { setRemoving(student); setMenu(null); }} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"><Trash2 className="size-4" />Remove Certificate</button> : <button disabled={!templateReady} onClick={() => add(student)} className="flex w-full items-center gap-2 px-4 py-3 text-sm hover:bg-slate-50 disabled:opacity-50"><Plus className="size-4 text-emerald-600" />Add Certificate</button>}</div>}
    </div>)}{!students.length && <div className="p-12 text-center text-sm text-slate-400">No enrolled students found.</div>}</div></section>
    <ConfirmDialog open={!!removing} title="Remove Certificate?" description={`Remove ${courseTitle} certificate from ${removing?.name || "this student"}?`} confirmLabel="Remove Certificate" onCancel={() => setRemoving(null)} onConfirm={remove} />
  </>;
}
