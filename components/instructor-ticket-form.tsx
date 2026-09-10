"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Upload, X } from "lucide-react";
import { CourseEditor } from "./course-editor";
import { toast } from "sonner";
type SupportRole = { id: string; name: string };
export function InstructorTicketForm({
  roles,
  basePath = "/dashboard/instructor/support/tickets",
}: {
  roles: SupportRole[];
  basePath?: string;
}) {
  const [selectedRole, setSelectedRole] = useState(""),
    [description, setDescription] = useState(""),
    [preview, setPreview] = useState<{
      name: string;
      url: string;
      image: boolean;
    } | null>(null),
    [busy, setBusy] = useState(false),
    router = useRouter();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedRole) return toast.error("Select a support role");
    const form = new FormData(e.currentTarget);
    form.set("role_id", selectedRole);
    form.set("description", description);
    setBusy(true);
    const res = await fetch("/api/instructor/tickets", {
        method: "POST",
        body: form,
      }),
      body = await res.json();
    if (!res.ok) {
      setBusy(false);
      return toast.error(body.error || "Ticket creation failed");
    }
    toast.success("Ticket submitted");
    router.push(basePath);
    router.refresh();
  }
  return (
    <>
      <button
        onClick={() => router.back()}
        className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500"
      >
        <ArrowLeft className="size-4" />
        Back to Tickets
      </button>
      <p className="text-sm text-slate-400">Support / Tickets / New</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">New Ticket</h1>
      <form
        onSubmit={submit}
        className="mt-7 space-y-5 rounded-2xl border bg-white p-5 sm:p-7"
      >
        <div className="relative">
          <label className="text-sm font-semibold">Role</label>
          <div className="relative mt-2">
            <select
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value)}
              className="field appearance-none border-slate-200 bg-slate-50 pr-10 font-semibold text-navy shadow-sm transition focus:border-red focus:bg-white"
              required
            >
              <option value="">Select support role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-red" />
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold">
            Subject
            <input name="subject" className="field mt-2" required />
          </label>
          <label className="text-sm font-semibold">
            Priority
            <div className="relative mt-2">
              <select
                name="priority"
                defaultValue="medium"
                className="field appearance-none border-slate-200 bg-slate-50 pr-10 font-semibold capitalize text-navy shadow-sm transition focus:border-red focus:bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-red" />
            </div>
          </label>
          <label className="text-sm font-semibold">
            Status
            <input
              value="Pending"
              readOnly
              className="field mt-2 bg-slate-50"
            />
          </label>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Description
          </label>
          <CourseEditor value={description} onChange={setDescription} />
        </div>
        <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50 p-4">
          <Upload className="size-7 text-red" />
          <b className="mt-2">Upload File</b>
          <input
            name="attachment"
            type="file"
            className="mt-3 text-xs"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f)
                setPreview({
                  name: f.name,
                  url: URL.createObjectURL(f),
                  image: f.type.startsWith("image/"),
                });
            }}
          />
        </label>
        {preview && (
          <div className="flex items-center gap-3 rounded-xl border p-3">
            {preview.image && (
              <img
                src={preview.url}
                className="size-16 rounded-lg object-cover"
                alt=""
              />
            )}
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">
              {preview.name}
            </span>
            <button type="button" onClick={() => setPreview(null)}>
              <X className="size-4" />
            </button>
          </div>
        )}
        <div className="flex justify-end">
          <button disabled={busy} className="btn-primary">
            {busy ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </form>
    </>
  );
}
