"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { CourseEditor } from "./course-editor";
type Value = {
  id: string;
  title: string;
  body: string;
  receiver_types: string[];
  attachment_url: string | null;
  scheduled_at?: string | null;
};
const types = [
  "student",
  "instructor",
  "admin_staff",
  "organization",
  "org_staff",
];
export function AnnouncementForm({ value }: { value?: Value }) {
  const [body, setBody] = useState(value?.body || ""),
    [selected, setSelected] = useState<string[]>(value?.receiver_types || []),
    [file, setFile] = useState(""),
    [busy, setBusy] = useState(false),
    router = useRouter();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected.length) return toast.error("Select at least one user type");
    if (body.replace(/<[^>]*>/g, "").trim().length < 2)
      return toast.error("Enter description");
    setBusy(true);
    const form = new FormData(e.currentTarget);
    form.set("body", body);
    selected.forEach((x) => form.append("receiver_types", x));
    const res = await fetch(
      value
        ? `/api/admin/announcements/${value.id}`
        : "/api/admin/announcements",
      { method: value ? "PATCH" : "POST", body: form },
    );
    if (res.ok) {
      toast.success(value ? "Announcement updated" : "Announcement created");
      router.push("/dashboard/super-admin/announcements");
      router.refresh();
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
        Back to Announcements
      </button>
      <p className="text-sm text-slate-400">Communication / Announcements</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">
        {value ? "Edit" : "Create"} Announcement
      </h1>
      <form
        onSubmit={submit}
        className="mt-7 space-y-6 rounded-xl border bg-white p-4 sm:p-7"
      >
        <label className="block text-sm font-semibold">
          Title
          <input
            name="title"
            defaultValue={value?.title}
            className="field mt-2"
            required
          />
        </label>
        <section>
          <label className="mb-2 block text-sm font-semibold">
            Description
          </label>
          <CourseEditor value={body} onChange={setBody} />
        </section>
        <label className="block max-w-md text-sm font-semibold">
          Schedule Date and Time (Optional)
          <input
            name="scheduled_at"
            type="datetime-local"
            defaultValue={
              value?.scheduled_at
                ? new Date(
                    new Date(value.scheduled_at).getTime() -
                      new Date(value.scheduled_at).getTimezoneOffset() * 60000,
                  )
                    .toISOString()
                    .slice(0, 16)
                : ""
            }
            className="field mt-2"
          />
        </label>
        <section>
          <label className="mb-2 block text-sm font-semibold">
            Select User Type
          </label>
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setSelected((x) =>
                    x.includes(type)
                      ? x.filter((y) => y !== type)
                      : [...x, type],
                  )
                }
                className={`rounded-full border px-4 py-2 text-sm capitalize ${selected.includes(type) ? "border-red bg-red text-white" : "bg-white text-slate-600"}`}
              >
                {type.replaceAll("_", " ")}
              </button>
            ))}
          </div>
        </section>
        <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50 p-4 text-center">
          <Upload className="mb-2 size-6 text-red" />
          <b className="text-sm">Upload File</b>
          <input
            name="attachment"
            type="file"
            className="mt-3 max-w-full text-xs"
            onChange={(e) => setFile(e.target.files?.[0]?.name || "")}
          />
        </label>
        {(file || value?.attachment_url) && (
          <div className="flex max-w-md items-center gap-3 rounded-lg border bg-slate-50 p-3">
            <FileText className="size-5 text-red" />
            <span className="min-w-0 flex-1 truncate text-xs">
              {file || "Current uploaded file"}
            </span>
            {file && (
              <button type="button" onClick={() => setFile("")}>
                <X className="size-4" />
              </button>
            )}
          </div>
        )}
        <div className="flex justify-end">
          <button disabled={busy} className="btn-primary">
            {busy ? "Saving…" : "Submit"}
          </button>
        </div>
      </form>
    </>
  );
}
