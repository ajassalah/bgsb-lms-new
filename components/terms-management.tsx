"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Save, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { CourseEditor } from "./course-editor";

type Terms = {
  id: string;
  version: string;
  title: string;
  effective_date: string;
  content: string;
  is_published: boolean;
  updated_at: string;
};

export function TermsManagement({
  initialTerms,
}: {
  initialTerms?: Terms | null;
}) {
  const [content, setContent] = useState(initialTerms?.content || "");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/legal-terms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: initialTerms?.id,
        version: form.get("version"),
        title: form.get("title"),
        effective_date: form.get("effective_date"),
        is_published: form.get("is_published") === "on",
        content,
      }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(body.error || "Terms & Conditions could not be saved");
      setBusy(false);
      return;
    }
    toast.success("Terms & Conditions saved");
    window.location.reload();
  }
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Platform / Legal</p>
          <h1 className="mt-1 text-2xl font-bold text-navy dark:text-white">
            Terms & Conditions
          </h1>
        </div>
        <Link
          href="/terms-and-conditions"
          target="_blank"
          className="btn-secondary gap-2"
        >
          <ExternalLink className="size-4" /> View Published Terms
        </Link>
      </div>
      <form
        onSubmit={submit}
        className="mt-7 space-y-6 rounded-2xl border bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:p-7"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-red/10 text-red">
            <ScrollText className="size-5" />
          </span>
          <div>
            <h2 className="font-bold text-navy dark:text-white">
              Legal document
            </h2>
            <p className="text-xs text-slate-400">
              Publishing a new version requires every user to accept it.
            </p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold">
            Title
            <input
              name="title"
              defaultValue={
                initialTerms?.title || "BGSB LMS Terms & Conditions"
              }
              className="field mt-2"
              required
            />
          </label>
          <label className="text-sm font-semibold">
            Terms Version
            <input
              name="version"
              defaultValue={initialTerms?.version || "1.0"}
              className="field mt-2"
              placeholder="1.0"
              required
            />
          </label>
          <label className="text-sm font-semibold">
            Effective Date
            <input
              name="effective_date"
              type="date"
              defaultValue={
                initialTerms?.effective_date ||
                new Date().toISOString().slice(0, 10)
              }
              className="field mt-2"
              required
            />
          </label>
          <label className="flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold">
            <input
              name="is_published"
              type="checkbox"
              defaultChecked={initialTerms?.is_published ?? true}
              className="size-4 accent-red-600"
            />{" "}
            Published
          </label>
        </div>
        <section>
          <label className="mb-2 block text-sm font-semibold">
            Terms & Conditions Content
          </label>
          <CourseEditor value={content} onChange={setContent} />
        </section>
        <div className="flex justify-end">
          <button disabled={busy} className="btn-primary gap-2">
            <Save className="size-4" />
            {busy ? "Saving…" : "Save Terms & Conditions"}
          </button>
        </div>
      </form>
    </div>
  );
}
