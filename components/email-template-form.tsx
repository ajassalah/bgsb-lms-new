"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Paperclip, Save, X } from "lucide-react";
import { toast } from "sonner";
import { CourseEditor } from "./course-editor";
export function EmailTemplateForm({
  template,
}: {
  template?: {
    id: string;
    subject: string;
    body: string;
    attachment_name: string | null;
    attachment_url: string | null;
  };
}) {
  const [body, setBody] = useState(template?.body || ""),
    [busy, setBusy] = useState(false),
    [attachment, setAttachment] = useState<File | null>(null),
    [preview, setPreview] = useState(template?.attachment_url || ""),
    [inputKey, setInputKey] = useState(0),
    router = useRouter();
  useEffect(() => {
    if (!attachment) return;
    const url = URL.createObjectURL(attachment);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [attachment]);
  const previewName =
    attachment?.name || template?.attachment_name || "Attachment";
  const isImage = attachment
    ? attachment.type.startsWith("image/")
    : /\.(png|jpe?g|gif|webp|svg)$/i.test(previewName);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    form.set("body", body);
    setBusy(true);
    const res = await fetch(
      template
        ? `/api/admin/email-templates/${template.id}`
        : "/api/admin/email-templates",
      { method: template ? "PATCH" : "POST", body: form },
    );
    if (res.ok) {
      toast.success(template ? "Template updated" : "Template created");
      router.push("/dashboard/super-admin/email-templates");
      router.refresh();
    } else {
      toast.error((await res.json()).error || "Save failed");
      setBusy(false);
    }
  }
  return (
    <>
      <p className="text-sm text-slate-400">Communication / Email Templates</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">
        {template ? "Edit" : "Create"} Email Template
      </h1>
      <form
        onSubmit={submit}
        className="mt-7 space-y-6 rounded-2xl border bg-white p-5 sm:p-7"
      >
        <label className="block text-sm font-semibold text-navy">
          Subject
          <input
            name="subject"
            defaultValue={template?.subject}
            required
            className="field mt-2"
          />
        </label>
        <section>
          <label className="mb-2 block text-sm font-semibold text-navy">
            Rich-text response
          </label>
          <CourseEditor value={body} onChange={setBody} />
        </section>
        <label className="block rounded-xl border border-dashed p-5 text-center text-sm text-slate-500">
          <Paperclip className="mx-auto mb-2 size-5" />
          Upload image or file
          <input
            name="attachment"
            type="file"
            key={inputKey}
            className="mt-3 block w-full text-xs"
            onChange={(event) => setAttachment(event.target.files?.[0] || null)}
          />
        </label>
        {preview && (
          <section className="relative max-w-md rounded-xl border bg-slate-50 p-3">
            <button
              type="button"
              aria-label="Remove preview"
              onClick={() => {
                setAttachment(null);
                setPreview("");
                setInputKey((value) => value + 1);
              }}
              className="absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-full bg-white text-red shadow"
            >
              <X className="size-4" />
            </button>
            {isImage ? (
              <img
                src={preview}
                alt={previewName}
                className="h-48 w-full rounded-lg object-contain"
              />
            ) : (
              <a
                href={preview}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-lg bg-white p-4 pr-10"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-red/10 text-red">
                  <FileText className="size-5" />
                </span>
                <span className="min-w-0">
                  <b className="block truncate text-sm text-navy">
                    {previewName}
                  </b>
                  <small className="text-slate-400">
                    Uploaded file preview
                  </small>
                </span>
              </a>
            )}
            <p className="mt-2 truncate text-xs text-slate-500">
              {previewName}
            </p>
          </section>
        )}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button disabled={busy} className="btn-primary gap-2">
            <Save className="size-4" />
            {busy ? "Saving…" : "Save Template"}
          </button>
        </div>
      </form>
    </>
  );
}
