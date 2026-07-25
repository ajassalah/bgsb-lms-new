"use client";
import { useMemo, useState } from "react";
import { Save, Search, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
export function AssignmentForm({
  courseId,
  moduleId,
  instructors,
  assignment,
}: {
  courseId: string;
  moduleId: string;
  instructors: { id: string; name: string }[];
  assignment?: {
    id: string;
    title: string;
    due_date: string;
    instructor_id: string;
    pass_marks: number;
    max_score: number;
    description: string;
    file_url?: string | null;
  };
}) {
  const [query, setQuery] = useState(""),
    [selected, setSelected] = useState(assignment?.instructor_id || ""),
    [open, setOpen] = useState(false),
    [file, setFile] = useState(""),
    [busy, setBusy] = useState(false),
    router = useRouter(),
    visible = useMemo(
      () =>
        instructors.filter((x) =>
          x.name.toLowerCase().includes(query.toLowerCase()),
        ),
      [instructors, query],
    );
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) {
      toast.error("Select an instructor");
      return;
    }
    setBusy(true);
    const form = new FormData(e.currentTarget);
    form.set("course_id", courseId);
    form.set("module_id", moduleId);
    form.set("instructor_id", selected);
    const res = await fetch(
      assignment
        ? `/api/admin/assignments/${assignment.id}`
        : "/api/admin/assignments",
      { method: assignment ? "PATCH" : "POST", body: form },
    );
    if (res.ok) {
      toast.success(assignment ? "Assignment updated" : "Assignment created");
      router.push(
        `/dashboard/super-admin/courses/${courseId}/curriculum/${moduleId}/assignments`,
      );
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || "Create failed");
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="rounded-xl border bg-white p-6">
      <h1 className="text-2xl font-bold text-navy">
        {assignment ? "Edit Assignment" : "Create Assignment"}
      </h1>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="text-sm font-semibold">
          Title
          <input
            name="title"
            defaultValue={assignment?.title}
            className="field mt-2"
            required
          />
        </label>
        <label className="text-sm font-semibold">
          Deadline (dd/mm/yyyy)
          <input
            name="due_date"
            type="date"
            defaultValue={assignment?.due_date.slice(0, 10)}
            className="field mt-2"
            required
          />
        </label>
        <div className="relative">
          <label className="text-sm font-semibold">Select Instructor</label>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="field mt-2 text-left"
          >
            {instructors.find((x) => x.id === selected)?.name ||
              "Choose instructor"}
          </button>
          {open && (
            <div className="absolute z-30 mt-1 w-full rounded-xl border bg-white p-2 shadow-xl">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="field py-2 pl-10"
                  placeholder="Search instructors..."
                />
              </label>
              <div className="max-h-48 overflow-y-auto">
                {visible.map((x) => (
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(x.id);
                      setOpen(false);
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                    key={x.id}
                  >
                    {x.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <label className="text-sm font-semibold">
          Pass Marks
          <input
            name="pass_marks"
            type="number"
            min="0"
            defaultValue={assignment?.pass_marks}
            className="field mt-2"
            required
          />
        </label>
        <label className="text-sm font-semibold">
          Total Marks
          <input
            name="max_score"
            type="number"
            min="1"
            defaultValue={assignment?.max_score ?? 100}
            className="field mt-2"
            required
          />
        </label>
      </div>
      <label className="mt-5 block text-sm font-semibold">
        Description
        <textarea
          name="description"
          defaultValue={assignment?.description}
          className="field mt-2 min-h-36"
          required
        />
      </label>
      <label className="mt-5 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50">
        <Upload className="mb-2 text-red" />
        <b>Upload assignment file</b>
        {assignment?.file_url && (
          <a
            href={assignment.file_url}
            target="_blank"
            className="mt-2 text-xs font-semibold text-blue-600"
          >
            Current uploaded file
          </a>
        )}
        <input
          name="file"
          type="file"
          className="mt-3 text-xs"
          onChange={(e) => setFile(e.target.files?.[0]?.name || "")}
        />
        {file && (
          <span className="mt-2 text-xs font-semibold text-emerald-600">
            File Uploaded: {file}
          </span>
        )}
      </label>
      <div className="mt-6 flex justify-end">
        <button disabled={busy} className="btn-primary gap-2">
          <Save className="size-4" />
          {busy
            ? "Saving…"
            : assignment
              ? "Save Changes"
              : "Create Assignment"}
        </button>
      </div>
    </form>
  );
}
