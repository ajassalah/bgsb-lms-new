"use client";
import Link from "next/link";
import { useState } from "react";
import { FileText, GripVertical } from "lucide-react";
import { toast } from "sonner";
type Assignment = {
  id: string;
  title: string;
  pass_marks: number;
  max_score: number;
  due_date: string;
};
type Module = {
  id: string;
  title: string;
  position: number;
  assignments: Assignment[];
};
export function AssignmentCourseOverview({
  courseId,
  title,
  thumbnailUrl,
  initialModules,
}: {
  courseId: string;
  title: string;
  thumbnailUrl: string | null;
  initialModules: Module[];
}) {
  const [modules, setModules] = useState(initialModules),
    [drag, setDrag] = useState<string | null>(null);
  async function reorder(target: string) {
    if (!drag || drag === target) return;
    const previous = modules,
      next = [...modules],
      from = next.findIndex((x) => x.id === drag),
      to = next.findIndex((x) => x.id === target),
      [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    const ordered = next.map((x, i) => ({ ...x, position: i + 1 }));
    setModules(ordered);
    setDrag(null);
    const res = await fetch("/api/admin/modules/reorder", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        course_id: courseId,
        module_ids: ordered.map((x) => x.id),
      }),
    });
    if (!res.ok) {
      setModules(previous);
      toast.error("Module order update failed");
    } else toast.success("Module order updated");
  }
  return (
    <>
      <div>
        <p className="text-sm text-slate-400">Assignments / {title}</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Drag module grip icons to change their order. Select an assignment
          preview to open it.
        </p>
      </div>
      <section className="mt-7 overflow-hidden rounded-2xl border bg-white">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-72 w-full bg-slate-50 object-contain p-2 lg:h-96"
          />
        ) : (
          <div className="grid h-56 place-items-center bg-slate-100 text-slate-400">
            No course thumbnail
          </div>
        )}
      </section>
      <div className="mt-7 space-y-5">
        {modules.map((module) => (
          <section
            draggable
            onDragStart={() => setDrag(module.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => reorder(module.id)}
            onDragEnd={() => setDrag(null)}
            key={module.id}
            className={`rounded-xl border bg-white ${drag === module.id ? "opacity-50" : ""}`}
          >
            <header className="flex items-center gap-4 border-b p-5">
              <button
                className="cursor-grab text-slate-400"
                title="Drag to move module"
              >
                <GripVertical className="size-6" />
              </button>
              <span className="grid size-10 place-items-center rounded-lg bg-navy font-bold text-white">
                {module.position}
              </span>
              <div>
                <small className="font-semibold uppercase text-slate-400">
                  Module No {module.position}
                </small>
                <h2 className="font-bold text-navy">{module.title}</h2>
              </div>
            </header>
            <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
              {module.assignments.map((a) => (
                <Link
                  href={`/dashboard/super-admin/courses/${courseId}/curriculum/${module.id}/assignments`}
                  target="_blank"
                  key={a.id}
                  className="group rounded-xl border bg-amber-50 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-amber-600">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <b className="block truncate text-sm text-navy">
                        {a.title}
                      </b>
                      <p className="mt-1 text-[11px] leading-5 text-amber-700">
                        Pass {a.pass_marks} · Total {a.max_score}
                        <br />
                        Due {new Date(a.due_date).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              {!module.assignments.length && (
                <p className="text-sm text-slate-400">
                  No assignments in this module.
                </p>
              )}
            </div>
          </section>
        ))}
        {!modules.length && (
          <div className="rounded-xl border border-dashed bg-white p-12 text-center text-slate-400">
            No modules created for this course.
          </div>
        )}
      </div>
    </>
  );
}
