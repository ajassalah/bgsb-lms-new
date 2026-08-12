"use client";
import { useMemo, useState } from "react";
import { Search, UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";

type Instructor = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};
export function CourseInstructorManagement({
  courseId,
  courseTitle,
  instructors,
  initialAssigned,
}: {
  courseId: string;
  courseTitle: string;
  instructors: Instructor[];
  initialAssigned: string[];
}) {
  const [assigned, setAssigned] = useState(initialAssigned),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [busy, setBusy] = useState(false);
  const filtered = useMemo(
    () =>
      instructors.filter((x) =>
        `${x.name} ${x.email}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [instructors, query],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 10)),
    visible = filtered.slice((page - 1) * 10, page * 10);
  async function save(next: string[]) {
    setBusy(true);
    const res = await fetch(`/api/admin/courses/${courseId}/instructors`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ instructor_ids: next }),
    });
    setBusy(false);
    if (!res.ok)
      return toast.error((await res.json()).error || "Assignment failed");
    setAssigned(next);
    toast.success("Course instructors updated");
  }
  const card = (x: Instructor, remove = false) => (
    <div
      key={x.id}
      className="flex items-center gap-3 rounded-xl border bg-white p-4"
    >
      <span className="grid size-11 place-items-center overflow-hidden rounded-full bg-navy font-bold text-white">
        {x.avatar ? (
          <img src={x.avatar} alt="" className="size-full object-cover" />
        ) : (
          x.name[0]
        )}
      </span>
      <span className="min-w-0 flex-1">
        <b className="block truncate text-navy">{x.name}</b>
        <small className="text-slate-400">{x.email}</small>
      </span>
      <button
        disabled={busy}
        onClick={() =>
          save(
            remove ? assigned.filter((id) => id !== x.id) : [...assigned, x.id],
          )
        }
        className={remove ? "btn-secondary gap-2" : "btn-primary gap-2"}
      >
        {remove ? (
          <UserMinus className="size-4" />
        ) : (
          <UserPlus className="size-4" />
        )}
        {remove ? "Remove" : "Assign"}
      </button>
    </div>
  );
  return (
    <>
      <p className="text-sm text-slate-400">Courses / Manage Instructor</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">{courseTitle}</h1>
      <section className="mt-7 rounded-2xl border bg-slate-50 p-5">
        <h2 className="font-bold text-navy">Assigned Instructors</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {instructors
            .filter((x) => assigned.includes(x.id))
            .map((x) => card(x, true))}
          {!assigned.length && (
            <p className="text-sm text-slate-400">No instructors assigned.</p>
          )}
        </div>
      </section>
      <section className="mt-6 rounded-2xl border bg-white p-5">
        <h2 className="font-bold text-navy">All Instructors</h2>
        <label className="relative mt-4 block max-w-lg">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="field pl-10"
            placeholder="Search instructor name or email..."
          />
        </label>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {visible.filter((x) => !assigned.includes(x.id)).map((x) => card(x))}
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="btn-secondary"
          >
            Previous
          </button>
          <span className="text-sm">
            {page} / {pages}
          </span>
          <button
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
            className="btn-secondary"
          >
            Next
          </button>
        </div>
      </section>
    </>
  );
}
