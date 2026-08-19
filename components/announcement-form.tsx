"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  FileText,
  Upload,
  Users,
  X,
} from "lucide-react";
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
  { value: "admin_staff", label: "Staffs" },
  { value: "instructor", label: "Instructors" },
  { value: "student", label: "Students" },
];
export function AnnouncementForm({ value }: { value?: Value }) {
  const [body, setBody] = useState(value?.body || ""),
    [selected, setSelected] = useState<string[]>(
      (value?.receiver_types || []).filter((item) =>
        types.some((type) => type.value === item),
      ),
    ),
    [receiverOpen, setReceiverOpen] = useState(false),
    [file, setFile] = useState(""),
    [busy, setBusy] = useState(false),
    receiverRef = useRef<HTMLDivElement>(null),
    router = useRouter();
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!receiverRef.current?.contains(event.target as Node))
        setReceiverOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
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
        <section ref={receiverRef} className="relative z-40 max-w-xl">
          <label className="mb-2 block text-sm font-semibold">
            Select User Type
          </label>
          <button
            type="button"
            onClick={() => setReceiverOpen((current) => !current)}
            className="field flex items-center justify-between text-left"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Users className="size-4 shrink-0 text-slate-400" />
              <span
                className={selected.length ? "text-navy" : "text-slate-400"}
              >
                {selected.length
                  ? types
                      .filter((type) => selected.includes(type.value))
                      .map((type) => type.label)
                      .join(", ")
                  : "Select receiver types"}
              </span>
            </span>
            <ChevronDown
              className={`size-4 shrink-0 transition ${receiverOpen ? "rotate-180" : ""}`}
            />
          </button>
          {receiverOpen && (
            <div className="absolute left-0 top-full z-[500] mt-2 w-full rounded-xl border bg-white p-2 shadow-2xl">
              <button
                type="button"
                onClick={() =>
                  setSelected(
                    selected.length === types.length
                      ? []
                      : types.map((type) => type.value),
                  )
                }
                className="flex w-full items-center justify-between rounded-lg border-b px-3 py-3 text-left text-sm font-bold text-red hover:bg-red/5"
              >
                Select All
                {selected.length === types.length && (
                  <Check className="size-4" />
                )}
              </button>
              <div className="mt-1 space-y-1">
                {types.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setSelected((current) =>
                        current.includes(type.value)
                          ? current.filter((item) => item !== type.value)
                          : [...current, type.value],
                      )
                    }
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm ${selected.includes(type.value) ? "bg-red/5 font-semibold text-red" : "text-navy hover:bg-slate-50"}`}
                  >
                    {type.label}
                    <span
                      className={`grid size-5 place-items-center rounded border ${selected.includes(type.value) ? "border-red bg-red text-white" : "border-slate-300"}`}
                    >
                      {selected.includes(type.value) && (
                        <Check className="size-3.5" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
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
