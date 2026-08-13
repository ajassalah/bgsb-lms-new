"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { CourseEditor } from "./course-editor";
import { useIsStaffPortal } from "./staff-permission-context";

type Faq = {
  id: string;
  question: string;
  answer: string;
  status: "active" | "inactive";
};
export function SupportFaqForm({ faq }: { faq?: Faq }) {
  const isStaff = useIsStaffPortal();
  const [answer, setAnswer] = useState(faq?.answer || ""),
    [busy, setBusy] = useState(false),
    router = useRouter();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (answer.replace(/<[^>]*>/g, "").trim().length < 2)
      return toast.error("Enter the FAQ answer");
    setBusy(true);
    const form = new FormData(event.currentTarget),
      body = {
        question: String(form.get("question") || ""),
        status: String(form.get("status") || "active"),
        answer,
      },
      res = await fetch(
        faq ? `/api/admin/support-faqs/${faq.id}` : "/api/admin/support-faqs",
        {
          method: faq ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
      );
    if (res.ok) {
      toast.success(faq ? "FAQ updated" : "FAQ created");
      const destination = isStaff
        ? "/dashboard/admin-staff/support/faq"
        : "/dashboard/super-admin/support/faq";
      if (faq) window.location.assign(destination);
      else {
        router.push(destination);
        router.refresh();
      }
    } else {
      toast.error((await res.json().catch(() => ({}))).error || "Save failed");
      setBusy(false);
    }
  }
  return (
    <>
      <button
        onClick={() => router.back()}
        className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500"
      >
        <ArrowLeft className="size-4" />
        Back to FAQ
      </button>
      <p className="text-sm text-slate-400">Support / FAQ</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">
        {faq ? "Edit FAQ" : "Create FAQ"}
      </h1>
      <form
        onSubmit={submit}
        className="mt-7 space-y-6 rounded-xl border bg-white p-4 sm:p-7"
      >
        <label className="block text-sm font-semibold">
          Question
          <input
            name="question"
            defaultValue={faq?.question}
            className="field mt-2"
            required
          />
        </label>
        <label className="block max-w-sm text-sm font-semibold">
          Status
          <select
            name="status"
            defaultValue={faq?.status || "active"}
            className="field mt-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <section>
          <label className="mb-2 block text-sm font-semibold">Answer</label>
          <CourseEditor value={answer} onChange={setAnswer} />
        </section>
        <div className="flex flex-col-reverse gap-3 min-[380px]:flex-row min-[380px]:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button disabled={busy} className="btn-primary gap-2">
            <Save className="size-4" />
            {busy ? "Saving…" : faq ? "Save Changes" : "Create FAQ"}
          </button>
        </div>
      </form>
    </>
  );
}
