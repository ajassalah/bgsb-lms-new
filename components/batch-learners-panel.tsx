"use client";

import { Mail, Search, Users, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useStaffCan } from "./staff-permission-context";

export type BatchLearner = {
  id: string;
  learnerNo: string;
  name: string;
  email: string;
};

export function BatchLearnersPanel({
  batchId,
  batchName,
  learners,
  fromEmail,
  basePath,
}: {
  batchId: string;
  batchName: string;
  learners: BatchLearner[];
  fromEmail: string;
  basePath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const canEmail = useStaffCan("batches", "send_email");
  const [showLearners, setShowLearners] = useState(false);
  const [showComposer, setShowComposer] = useState(searchParams?.get("compose") === "1");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(learners.map((learner) => learner.id));
  const [sending, setSending] = useState(false);
  const filtered = useMemo(
    () =>
      learners.filter((learner) =>
        `${learner.learnerNo} ${learner.name} ${learner.email}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [learners, query],
  );
  const closeComposer = () => {
    setShowComposer(false);
    router.replace(`${basePath}/${batchId}`);
  };
  const selectAllFiltered = filtered.length > 0 && filtered.every((learner) => selected.includes(learner.id));
  function toggleLearner(id: string) {
    setSelected((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));
  }
  function toggleAll() {
    const ids = filtered.map((learner) => learner.id);
    setSelected((current) =>
      selectAllFiltered
        ? current.filter((id) => !ids.includes(id))
        : Array.from(new Set([...current, ...ids])),
    );
  }
  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected.length) return toast.error("Select at least one learner");
    const form = new FormData(event.currentTarget);
    setSending(true);
    const response = await fetch(`/api/admin/batches/${batchId}/email`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        studentIds: selected,
        subject: String(form.get("subject") || ""),
        message: String(form.get("message") || ""),
      }),
    });
    setSending(false);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return toast.error(body.error || "Email could not be sent");
    toast.success(`Email sent to ${body.sent || selected.length} learner${selected.length === 1 ? "" : "s"}`);
    closeComposer();
  }
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setShowLearners(true)} className="btn-secondary gap-2">
          <Users className="size-4" /> Learners ({learners.length})
        </button>
        {canEmail && (
          <button onClick={() => setShowComposer(true)} className="btn-primary gap-2">
            <Mail className="size-4" /> Send a Mail
          </button>
        )}
      </div>
      {showLearners && (
        <LearnerModal title={`${batchName} learners`} close={() => setShowLearners(false)}>
          <LearnerTable learners={learners} query={query} setQuery={setQuery} />
        </LearnerModal>
      )}
      {showComposer && canEmail && (
        <LearnerModal title="Send bulk email" close={closeComposer} wide>
          <form onSubmit={send}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold">From<input readOnly value={fromEmail} className="field mt-2 bg-slate-50" /></label>
              <label className="text-sm font-semibold">To<input readOnly value={`${selected.length} selected learner${selected.length === 1 ? "" : "s"}`} className="field mt-2 bg-slate-50" /></label>
            </div>
            <label className="mt-4 block text-sm font-semibold">Subject<input name="subject" required className="field mt-2" placeholder="Email subject" /></label>
            <label className="mt-4 block text-sm font-semibold">Message<textarea name="message" required className="field mt-2 min-h-32" placeholder="Write your message" /></label>
            <div className="mt-5 rounded-xl border">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
                <b className="text-sm">Recipients</b>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={selectAllFiltered} onChange={toggleAll} /> Select all shown</label>
              </div>
              <LearnerTable learners={filtered} query={query} setQuery={setQuery} selected={selected} toggle={toggleLearner} selectable />
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={closeComposer} className="btn-secondary">Cancel</button><button disabled={sending || !selected.length} className="btn-primary">{sending ? "Sending..." : `Send to ${selected.length}`}</button></div>
          </form>
        </LearnerModal>
      )}
    </>
  );
}

function LearnerModal({ title, close, children, wide = false }: { title: string; close: () => void; children: React.ReactNode; wide?: boolean }) {
  return <div className="fixed inset-0 z-[250] grid place-items-center bg-black/50 p-4"><div className={`relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ${wide ? "max-w-4xl" : "max-w-3xl"}`}><button type="button" onClick={close} className="absolute right-5 top-5 text-slate-500"><X className="size-5" /></button><h2 className="pr-8 text-xl font-bold text-navy">{title}</h2><div className="mt-5">{children}</div></div></div>;
}

function LearnerTable({ learners, query, setQuery, selected, toggle, selectable = false }: { learners: BatchLearner[]; query: string; setQuery: (value: string) => void; selected?: string[]; toggle?: (id: string) => void; selectable?: boolean }) {
  return <><label className="relative mb-4 block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="field pl-10" placeholder="Search learner number, name or email" /></label><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-400"><tr>{selectable && <th className="p-3">Select</th>}<th className="p-3">Learner No</th><th className="p-3">Learner Name</th><th className="p-3">Learner Email</th></tr></thead><tbody className="divide-y">{learners.map((learner) => <tr key={learner.id}>{selectable && <td className="p-3"><input type="checkbox" checked={selected?.includes(learner.id) || false} onChange={() => toggle?.(learner.id)} /></td>}<td className="p-3 font-semibold">{learner.learnerNo}</td><td className="p-3">{learner.name}</td><td className="p-3">{learner.email}</td></tr>)}{!learners.length && <tr><td colSpan={selectable ? 4 : 3} className="p-6 text-center text-slate-400">No learners found.</td></tr>}</tbody></table></div></>;
}
