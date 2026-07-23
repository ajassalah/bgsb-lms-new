"use client";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  FileAudio,
  FileText,
  GripVertical,
  HelpCircle,
  MoreVertical,
  Plus,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { VideoPlayer } from "./video-player";
type Lesson = {
  id: string;
  title: string;
  content_type: "video" | "audio" | "document";
  content_url: string;
  description?: string;
  position: number;
};
type Quiz = { id: string; title: string };
type Assignment = {
  id: string;
  title: string;
  pass_marks: number;
  due_date: string;
};
export type ModuleRow = {
  id: string;
  courseId: string;
  title: string;
  position: number;
  lessons: Lesson[];
  quizzes: Quiz[];
  assignments: Assignment[];
};
type Modal = {
  type: "module" | "lesson" | "quiz";
  module?: ModuleRow;
  lessonType?: "video" | "audio" | "document";
};
export function CurriculumManagement({
  courseId,
  courseTitle,
  initialModules,
}: {
  courseId: string;
  courseTitle: string;
  initialModules: ModuleRow[];
}) {
  const [modules, setModules] = useState(initialModules),
    [modal, setModal] = useState<Modal | null>(null),
    [menu, setMenu] = useState<string | null>(null),
    [lessonMenu, setLessonMenu] = useState<string | null>(null),
    [page, setPage] = useState(1),
    [drag, setDrag] = useState<string | null>(null);
  const pages = Math.max(1, Math.ceil(modules.length / 10)),
    visible = modules.slice((page - 1) * 10, page * 10);
  async function reorder(target: string) {
    if (!drag || drag === target) return;
    const next = [...modules],
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
      setModules(modules);
      toast.error("Order update failed");
    }
  }
  async function remove(m: ModuleRow) {
    if (!confirm(`Delete “${m.title}”?`)) return;
    const res = await fetch(`/api/admin/modules/${m.id}`, { method: "DELETE" });
    if (res.ok) setModules((x) => x.filter((y) => y.id !== m.id));
  }
  function saved(item: any) {
    if (!modal) return;
    if (modal.type === "module")
      setModules((x) =>
        modal.module
          ? x.map((y) => (y.id === item.id ? { ...y, title: item.title } : y))
          : [...x, { ...item, courseId, lessons: [], quizzes: [], assignments: [] }],
      );
    else if (modal.module)
      setModules((x) =>
        x.map((y) =>
          y.id === modal.module!.id
            ? {
                ...y,
                [modal.type === "lesson" ? "lessons" : "quizzes"]: [
                  ...y[modal.type === "lesson" ? "lessons" : "quizzes"],
                  item,
                ],
              }
            : y,
        ),
      );
    setModal(null);
  }
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">
            Courses / {courseTitle} / Curriculum
          </p>
          <h1 className="mt-1 text-2xl font-bold text-navy">Curriculum</h1>
          <p className="mt-2 text-sm text-slate-500">
            Drag the grip to reorder sections. Lessons and quizzes preview
            inside each section.
          </p>
        </div>
        <button
          onClick={() => setModal({ type: "module" })}
          className="btn-primary gap-2"
        >
          <Plus className="size-4" />
          Add Module
        </button>
      </div>
      <div className="mt-7 space-y-5">
        {visible.map((m) => (
          <section
            draggable
            onDragStart={() => setDrag(m.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => reorder(m.id)}
            onDragEnd={() => setDrag(null)}
            className={`relative overflow-visible rounded-xl border bg-white ${drag === m.id ? "opacity-50" : ""}`}
            key={m.id}
          >
            <div className="flex items-center gap-4 border-b p-5">
              <button
                title="Drag to move section"
                className="cursor-grab text-slate-400"
              >
                <GripVertical className="size-6" />
              </button>
              <span className="grid size-10 place-items-center rounded-lg bg-navy font-bold text-white">
                {m.position}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Module No {m.position}
                </p>
                <h2 className="font-bold text-navy">{m.title}</h2>
                <p className="text-xs text-slate-400">
                  {m.lessons.length} lessons · {m.quizzes.length} quizzes
                </p>
              </div>
              <div className="relative ml-auto">
                <button
                  onClick={() => {
                    setMenu(menu === m.id ? null : m.id);
                    setLessonMenu(null);
                  }}
                  className="grid size-9 place-items-center rounded-lg border"
                >
                  <MoreVertical className="size-4" />
                </button>
                {menu === m.id && (
                  <div className="absolute right-0 top-11 z-[100] w-52 rounded-lg border bg-white py-1 shadow-2xl">
                    <button
                      onClick={() => setModal({ type: "module", module: m })}
                      className="action-row"
                    >
                      <Edit3 />
                      Edit Section
                    </button>
                    <button
                      onClick={() => setModal({ type: "quiz", module: m })}
                      className="action-row"
                    >
                      <HelpCircle />
                      Add Quiz
                    </button>
                    <a
                      href={`/dashboard/super-admin/courses/${courseId}/curriculum/${m.id}/assignments`}
                      className="action-row"
                    >
                      <FileText />
                      Add Assignment
                    </a>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setLessonMenu(lessonMenu === m.id ? null : m.id)
                        }
                        className="action-row"
                      >
                        <Plus />
                        Add Lesson
                        <ChevronRight className="ml-auto" />
                      </button>
                      {lessonMenu === m.id && (
                        <div className="absolute right-full top-0 mr-1 w-52 rounded-lg border bg-white py-1 shadow-xl">
                          <button
                            onClick={() =>
                              setModal({
                                type: "lesson",
                                module: m,
                                lessonType: "video",
                              })
                            }
                            className="action-row"
                          >
                            <Video />
                            Add Video Lesson
                          </button>
                          <button
                            onClick={() =>
                              setModal({
                                type: "lesson",
                                module: m,
                                lessonType: "audio",
                              })
                            }
                            className="action-row"
                          >
                            <FileAudio />
                            Add Audio Lesson
                          </button>
                          <button
                            onClick={() =>
                              setModal({
                                type: "lesson",
                                module: m,
                                lessonType: "document",
                              })
                            }
                            className="action-row"
                          >
                            <FileText />
                            Add Document Lesson
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => remove(m)}
                      className="action-row text-red"
                    >
                      <Trash2 />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            <ModuleContent module={m} />
          </section>
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-1">
        <Page disabled={page === 1} onClick={() => setPage(page - 1)}>
          <ChevronLeft />
          Previous
        </Page>
        {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
          <button
            onClick={() => setPage(n)}
            className={`grid size-9 place-items-center rounded-lg ${page === n ? "bg-red text-white" : "border bg-white"}`}
            key={n}
          >
            {n}
          </button>
        ))}
        <Page disabled={page === pages} onClick={() => setPage(page + 1)}>
          Next
          <ChevronRight />
        </Page>
      </div>
      {modal && (
        <EditorModal
          courseId={courseId}
          state={modal}
          close={() => setModal(null)}
          saved={saved}
        />
      )}
      <style jsx global>{`
        .action-row {
          display: flex;
          width: 100%;
          align-items: center;
          gap: 0.65rem;
          padding: 0.65rem 1rem;
          font-size: 0.875rem;
        }
        .action-row:hover {
          background: #f8fafc;
        }
        .action-row svg {
          width: 1rem;
          height: 1rem;
        }
      `}</style>
    </>
  );
}
function ModuleContent({ module }: { module: ModuleRow }) {
  const videos = module.lessons.filter((x) => x.content_type === "video"),
    medium = module.lessons.filter((x) => x.content_type !== "video");
  if (!module.lessons.length && !module.quizzes.length && !module.assignments.length)
    return (
      <div className="p-5 text-sm text-slate-400">
        No lessons or quizzes in this section.
      </div>
    );
  return (
    <div className="space-y-5 p-5">
      {videos.map((x) => (
        <article
          className="max-w-2xl overflow-hidden rounded-xl border bg-slate-950"
          key={x.id}
        >
          <VideoPlayer src={x.content_url} />
          <div className="bg-white p-4">
            <b className="text-navy">{x.title}</b>
            {x.description && (
              <p className="mt-1 text-sm text-slate-500">{x.description}</p>
            )}
          </div>
        </article>
      ))}
      {(medium.length > 0 ||
        module.quizzes.length > 0 ||
        module.assignments.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {medium.map((x) => (
            <article className="rounded-xl border bg-slate-50 p-4" key={x.id}>
              <div className="flex items-start gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-white text-red">
                  {x.content_type === "audio" ? <FileAudio /> : <FileText />}
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block text-navy">{x.title}</b>
                  <small className="capitalize text-slate-400">
                    {x.content_type} lesson
                  </small>
                </div>
                {x.content_type === "document" && (
                  <a
                    href={`${x.content_url}?download=${encodeURIComponent(
                      downloadName(x.title, x.content_url),
                    )}`}
                    download
                    title="Download document"
                  >
                    <Download className="size-4 text-blue-600" />
                  </a>
                )}
              </div>
              {x.content_type === "audio" && (
                <audio controls className="mt-4 w-full" src={x.content_url} />
              )}{" "}
              {x.description && (
                <p className="mt-3 text-sm text-slate-500">{x.description}</p>
              )}
            </article>
          ))}
          {module.quizzes.map((q) => (
            <article
              className="rounded-xl border border-violet-100 bg-violet-50 p-4"
              key={q.id}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-white text-violet-600">
                  <HelpCircle />
                </span>
                <div>
                  <b className="text-navy">{q.title}</b>
                  <p className="text-xs text-violet-500">Quiz</p>
                </div>
              </div>
            </article>
          ))}
          {module.assignments.map((a) => (
            <article
              className="rounded-xl border border-amber-100 bg-amber-50 p-4"
              key={a.id}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-white text-amber-600">
                  <FileText />
                </span>
                <div>
                  <b className="text-navy">{a.title}</b>
                  <p className="text-xs text-amber-700">
                    Pass Marks: {a.pass_marks} · Deadline:{" "}
                    {new Date(a.due_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
function EditorModal({
  courseId,
  state,
  close,
  saved,
}: {
  courseId: string;
  state: Modal;
  close: () => void;
  saved: (x: any) => void;
}) {
  const [busy, setBusy] = useState(false),
    [file, setFile] = useState(""),
    heading =
      state.type === "module"
        ? state.module
          ? "Edit Section"
          : "Add Module"
        : state.type === "quiz"
          ? "Add Quiz"
          : `Add ${state.lessonType} Lesson`;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    let url = "",
      method = "POST",
      body: BodyInit,
      headers: HeadersInit | undefined;
    if (state.type === "lesson") {
      const f = new FormData(e.currentTarget);
      f.set("module_id", state.module!.id);
      f.set("content_type", state.lessonType!);
      url = "/api/admin/lessons";
      body = f;
    } else {
      body = JSON.stringify({
        ...Object.fromEntries(new FormData(e.currentTarget)),
        course_id: courseId,
        module_id: state.module?.id,
      });
      headers = { "content-type": "application/json" };
      url =
        state.type === "quiz"
          ? "/api/admin/quizzes"
          : state.module
            ? `/api/admin/modules/${state.module.id}`
            : "/api/admin/modules";
      if (state.type === "module" && state.module) method = "PATCH";
    }
    const res = await fetch(url, { method, headers, body });
    if (res.ok) saved(await res.json());
    else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || "Save failed");
      setBusy(false);
    }
  }
  const accept =
    state.lessonType === "video"
      ? ".mp4,video/mp4"
      : state.lessonType === "audio"
        ? ".mp3,audio/mpeg"
        : "*/*";
  return (
    <div className="fixed inset-0 z-[130] grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6"
      >
        <div className="flex justify-between">
          <h2 className="text-xl font-bold text-navy">{heading}</h2>
          <button type="button" onClick={close}>
            <X />
          </button>
        </div>
        <label className="mt-6 block text-sm font-semibold">
          Title
          <input
            name="title"
            defaultValue={state.type === "module" ? state.module?.title : ""}
            className="field mt-2"
            required
          />
        </label>
        {state.type === "lesson" && (
          <>
            <label className="mt-5 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50 p-5 text-center">
              <Upload className="mb-3 size-8 text-red" />
              <b>Upload {state.lessonType}</b>
              <span className="text-xs text-slate-400">
                {state.lessonType === "document"
                  ? "Any file except MP3 and MP4"
                  : state.lessonType === "audio"
                    ? "MP3 only"
                    : "MP4 only"}
              </span>
              <input
                name="file"
                type="file"
                accept={accept}
                required
                className="mt-4 text-xs"
                onChange={(e) => setFile(e.target.files?.[0]?.name || "")}
              />
              {file && (
                <span className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                  File Uploaded: {file}
                </span>
              )}
            </label>
            <label className="mt-5 block text-sm font-semibold">
              Description
              <textarea name="description" className="field mt-2 min-h-28" />
            </label>
          </>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={close} className="btn-secondary">
            Cancel
          </button>
          <button disabled={busy} className="btn-primary">
            {busy ? "Uploading…" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
function downloadName(title: string, url: string) {
  const cleanUrl = url.split("?")[0];
  const storedName = decodeURIComponent(cleanUrl.split("/").pop() || "");
  const extension = storedName.match(/\.([a-z0-9]{1,10})$/i)?.[1];
  const safeTitle =
    title.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").trim() || "document";

  return extension ? `${safeTitle}.${extension}` : safeTitle;
}

function Page({
  children,
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className="flex items-center gap-1 rounded-lg border bg-white px-3 py-2 text-xs disabled:opacity-40"
    >
      {children}
    </button>
  );
}
