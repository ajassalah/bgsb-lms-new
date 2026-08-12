"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, FileText, GripVertical, MoreVertical } from "lucide-react";
import { toast } from "sonner";
type Assignment = {
  id: string;
  title: string;
  pass_marks: number;
  max_score: number;
  due_date: string;
  file_url: string | null;
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
  students = [],
  basePath = "/dashboard/super-admin/assignments",
  readOnly = false,
}: {
  courseId: string;
  title: string;
  thumbnailUrl: string | null;
  initialModules: Module[];
  students?: { id: string; name: string; email: string; avatar: string | null }[];
  basePath?: string;
  readOnly?: boolean;
}) {
  const [modules, setModules] = useState(initialModules),
    [drag, setDrag] = useState<string | null>(null),
    [tab, setTab] = useState<"assignments" | "students">("assignments"),
    [menu, setMenu] = useState<string | null>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest("[data-student-action]")) setMenu(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  async function reorder(target: string) {
    if (readOnly || !drag || drag === target) return;
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
        <p className="mt-2 text-sm text-slate-500">Review course assignments and enrolled students.</p>
      </div>
      <div className="mt-6 flex gap-2 border-b">
        {(["assignments", "students"] as const).map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`border-b-2 px-5 py-3 text-sm font-bold capitalize ${tab === item ? "border-red-500 text-red-600" : "border-transparent text-slate-500"}`}>
            {item}
          </button>
        ))}
      </div>
      {tab === "students" ? (
        <section className="mt-7 overflow-visible rounded-xl border bg-white">
          <div className="overflow-x-auto lg:overflow-visible">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400"><tr><th className="p-5">#</th><th className="p-5">Student Name</th><th className="p-5 text-right">Action</th></tr></thead>
              <tbody className="divide-y">
                {students.map((student, index) => (
                  <tr key={student.id}>
                    <td className="p-5 text-slate-400">{index + 1}</td>
                    <td className="p-5"><div className="flex items-center gap-3">{student.avatar ? <img src={student.avatar} alt="" className="size-10 rounded-full object-cover" /> : <span className="grid size-10 place-items-center rounded-full bg-slate-100 font-bold">{student.name.charAt(0)}</span>}<div><b className="block text-navy">{student.name}</b><small className="text-slate-400">{student.email}</small></div></div></td>
                    <td className="relative p-5" data-student-action><div className="flex justify-end"><button onClick={() => setMenu(menu === student.id ? null : student.id)} className="grid size-9 place-items-center rounded-lg border"><MoreVertical className="size-4" /></button></div>{menu === student.id && <div className="absolute right-5 top-14 z-[100] w-40 rounded-xl border bg-white py-1 shadow-xl"><Link href={`${basePath}/${courseId}/students/${student.id}`} className="flex items-center gap-2 px-4 py-3 hover:bg-slate-50"><Eye className="size-4" />View</Link></div>}</td>
                  </tr>
                ))}
                {!students.length && <tr><td colSpan={3} className="p-10 text-center text-slate-400">No enrolled students found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      ) : <>
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
            draggable={!readOnly}
            onDragStart={() => !readOnly && setDrag(module.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => reorder(module.id)}
            onDragEnd={() => setDrag(null)}
            key={module.id}
            className={`rounded-xl border bg-white ${drag === module.id ? "opacity-50" : ""}`}
          >
            <header className="flex items-center gap-4 border-b p-5">
              <span
                className={readOnly ? "text-slate-400" : "cursor-grab text-slate-400"}
                title={readOnly ? "Module order" : "Drag to move module"}
              >
                <GripVertical className="size-6" />
              </span>
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
                  href={a.file_url || (readOnly ? "#" : `/dashboard/super-admin/courses/${courseId}/curriculum/${module.id}/assignments`)}
                  target={a.file_url ? "_blank" : undefined}
                  rel={a.file_url ? "noreferrer" : undefined}
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
                      {a.file_url && <small className="mt-2 block font-semibold text-red-600">Open uploaded assignment</small>}
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
      </>}
    </>
  );
}
