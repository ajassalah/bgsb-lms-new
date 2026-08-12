"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronDown, Search, Upload, X } from "lucide-react";
import { CourseEditor } from "./course-editor";
import { toast } from "sonner";
type Staff = { id: string; name: string; email: string; avatar: string | null };
export function InstructorTicketForm({ staff, basePath = "/dashboard/instructor/support/tickets" }: { staff: Staff[]; basePath?: string }) {
  const [selected, setSelected] = useState<string[]>([]),
    [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [description, setDescription] = useState(""),
    [preview, setPreview] = useState<{
      name: string;
      url: string;
      image: boolean;
    } | null>(null),
    [busy, setBusy] = useState(false),
    router = useRouter(),
    visible = useMemo(
      () =>
        staff.filter((x) =>
          `${x.name} ${x.email}`.toLowerCase().includes(query.toLowerCase()),
        ),
      [staff, query],
    );
  function toggle(id: string) {
    setSelected((x) =>
      x.includes(id) ? x.filter((y) => y !== id) : [...x, id],
    );
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected.length) return toast.error("Select at least one staff user");
    const form = new FormData(e.currentTarget);
    selected.forEach((id) => form.append("staff_ids", id));
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
          <label className="text-sm font-semibold">Staff</label>
          <button
            type="button"
            onClick={() => setOpen((x) => !x)}
            className="field mt-2 flex items-center justify-between text-left"
          >
            <span>
              {selected.length
                ? `${selected.length} staff selected`
                : "Select staff users"}
            </span>
            <ChevronDown className="size-4" />
          </button>
          {open && (
            <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white p-2 shadow-xl">
              <label className="flex items-center gap-2 rounded-lg border px-3">
                <Search className="size-4" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-10 flex-1 outline-none"
                  placeholder="Search staff..."
                />
              </label>
              <div className="mt-2 max-h-56 overflow-y-auto">
                {visible.map((x) => (
                  <button
                    type="button"
                    onClick={() => toggle(x.id)}
                    key={x.id}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-slate-50"
                  >
                    {x.avatar ? (
                      <img
                        src={x.avatar}
                        className="size-9 rounded-full object-cover"
                        alt=""
                      />
                    ) : (
                      <span className="grid size-9 place-items-center rounded-full bg-navy text-white">
                        {x.name[0]}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-sm">{x.name}</b>
                      <small>{x.email}</small>
                    </span>
                    {selected.includes(x.id) && (
                      <Check className="size-4 text-red" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold">
            Subject
            <input name="subject" className="field mt-2" required />
          </label>
          <label className="text-sm font-semibold">
            Priority
            <select
              name="priority"
              defaultValue="medium"
              className="field mt-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
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
            {busy ? "Submitting…" : "Submit Ticket"}
          </button>
        </div>
      </form>
    </>
  );
}
