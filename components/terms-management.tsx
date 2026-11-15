"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, ExternalLink, History, Save, ScrollText, Tag } from "lucide-react";
import { toast } from "sonner";
import { CourseEditor } from "./course-editor";
import { Toggle } from "./portal/controls";

type Terms = {
  id: string;
  version: string;
  title: string;
  effective_date: string;
  content: string;
  is_published: boolean;
  updated_at: string;
};

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

export function TermsManagement({
  initialTerms,
}: {
  initialTerms?: Terms | null;
}) {
  const [content, setContent] = useState(initialTerms?.content || "");
  const [published, setPublished] = useState(initialTerms?.is_published ?? true);
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
        is_published: published,
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
    <form onSubmit={submit} className="mx-auto w-full max-w-[1200px]">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#DFE1E6] pb-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-[3px] bg-[#DEEBFF] text-[#0052CC]">
            <ScrollText className="size-5" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold leading-7 text-[#172B4D]">
              Terms &amp; Conditions
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#6B778C]">
              <span
                className={`rounded-[3px] px-1 text-[11px] font-bold uppercase leading-4 ${
                  initialTerms?.is_published
                    ? "bg-[#E3FCEF] text-[#006644]"
                    : "bg-[#FFF4E5] text-[#974F0C]"
                }`}
              >
                {initialTerms ? (initialTerms.is_published ? "Published" : "Draft") : "Not created"}
              </span>
              {initialTerms && (
                <span>
                  Version {initialTerms.version} · Updated {formatDate(initialTerms.updated_at)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/terms-and-conditions" target="_blank" className="btn-secondary">
            <ExternalLink className="size-4" /> View published
          </Link>
          <button disabled={busy} className="btn-primary">
            <Save className="size-4" />
            {busy ? "Saving…" : published ? "Save & publish" : "Save draft"}
          </button>
        </div>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="card min-w-0 !p-0">
          <header className="border-b border-[#DFE1E6] px-5 py-3.5">
            <h2 className="text-base font-semibold text-[#172B4D]">Document content</h2>
            <p className="mt-0.5 text-xs text-[#6B778C]">
              Use headings for each section — they become the &ldquo;On this page&rdquo; links on the
              public page.
            </p>
          </header>
          <div className="ds-terms-editor p-5">
            <CourseEditor value={content} onChange={setContent} />
          </div>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-6">
          <section className="card !p-0">
            <header className="border-b border-[#DFE1E6] px-5 py-3.5">
              <h2 className="text-base font-semibold text-[#172B4D]">Document details</h2>
            </header>
            <div className="space-y-4 px-5 py-4">
              <label className="block">
                Title
                <input
                  name="title"
                  defaultValue={initialTerms?.title || "BGSB LMS Terms & Conditions"}
                  className="field mt-1.5"
                  required
                />
              </label>
              <label className="block">
                Version
                <input
                  name="version"
                  defaultValue={initialTerms?.version || "1.0"}
                  className="field mt-1.5"
                  placeholder="1.0"
                  required
                />
              </label>
              <label className="block">
                Effective date
                <input
                  name="effective_date"
                  type="date"
                  defaultValue={
                    initialTerms?.effective_date || new Date().toISOString().slice(0, 10)
                  }
                  className="field mt-1.5"
                  required
                />
              </label>
            </div>
          </section>

          <section className="card !p-0">
            <header className="border-b border-[#DFE1E6] px-5 py-3.5">
              <h2 className="text-base font-semibold text-[#172B4D]">Publishing</h2>
            </header>
            <div className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#172B4D]">Published</p>
                  <p className="mt-0.5 text-xs leading-4 text-[#6B778C]">
                    Publishing a new version asks every user to accept it at their next visit.
                  </p>
                </div>
                <Toggle
                  checked={published}
                  onChange={setPublished}
                  label="Published"
                  size="large"
                />
              </div>
            </div>
            {initialTerms && (
              <dl className="border-t border-[#DFE1E6] px-5 py-2">
                {[
                  { label: "Version", value: initialTerms.version, icon: Tag },
                  { label: "Effective", value: formatDate(initialTerms.effective_date), icon: CalendarCheck },
                  { label: "Last updated", value: formatDate(initialTerms.updated_at), icon: History },
                ].map((row) => (
                  <div key={row.label} className="ds-detail-row flex items-center gap-2.5 py-2.5">
                    <row.icon className="size-4 shrink-0 text-[#6B778C]" />
                    <dt className="text-sm text-[#6B778C]">{row.label}</dt>
                    <dd className="ml-auto text-sm font-medium text-[#172B4D]">{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        </aside>
      </div>
    </form>
  );
}
