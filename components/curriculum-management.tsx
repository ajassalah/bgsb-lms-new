"use client";
import { useEffect, useState } from "react";
import {
  ChevronDown,
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
import { ConfirmDialog } from "./confirm-dialog";
import { BulkImportDialog } from "./bulk-import-dialog";
import { CollapsibleMedia } from "./collapsible-media";
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
  description?: string | null;
  position: number;
  lessons: Lesson[];
  quizzes: Quiz[];
  assignments: Assignment[];
};
type Modal = {
  type: "module" | "lesson" | "quiz";
  module?: ModuleRow;
  lessonType?: "video" | "audio" | "document";
  lesson?: Lesson;
  quiz?: Quiz;
};
export function CurriculumManagement({
  courseId,
  courseTitle,
  thumbnailUrl,
  videoSource,
  videoUrl,
  initialModules,
  readOnly = false,
}: {
  courseId: string;
  courseTitle: string;
  thumbnailUrl?: string | null;
  videoSource?: string | null;
  videoUrl?: string | null;
  initialModules: ModuleRow[];
  readOnly?: boolean;
}) {
  const [modules, setModules] = useState(initialModules),
    [modal, setModal] = useState<Modal | null>(null),
    [menu, setMenu] = useState<string | null>(null),
    [collapsedModules, setCollapsedModules] = useState<Set<string>>(
      () => new Set(),
    ),
    [lessonMenu, setLessonMenu] = useState<string | null>(null),
    [page, setPage] = useState(1),
    [drag, setDrag] = useState<string | null>(null),
    [deleting, setDeleting] = useState<ModuleRow | null>(null);
  const pages = Math.max(1, Math.ceil(modules.length / 10)),
    visible = modules.slice((page - 1) * 10, page * 10);
  useEffect(() => setModules(initialModules), [initialModules]);
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
    const res = await fetch(`/api/admin/modules/${m.id}`, { method: "DELETE" });
    if (res.ok) {
      setModules((x) => x.filter((y) => y.id !== m.id));
      setDeleting(null);
    }
  }
  async function removeLesson(moduleId: string, lessonId: string) {
    const res = await fetch(`/api/admin/lessons/${lessonId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setModules((rows) =>
        rows.map((row) =>
          row.id === moduleId
            ? {
                ...row,
                lessons: row.lessons.filter((lesson) => lesson.id !== lessonId),
              }
            : row,
        ),
      );
      toast.success("Lesson deleted");
    } else toast.error("Lesson could not be deleted");
  }
  async function removeAssignment(moduleId: string, assignmentId: string) {
    const res = await fetch(`/api/admin/assignments/${assignmentId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setModules((rows) =>
        rows.map((row) =>
          row.id === moduleId
            ? {
                ...row,
                assignments: row.assignments.filter(
                  (item) => item.id !== assignmentId,
                ),
              }
            : row,
        ),
      );
      toast.success("Assignment deleted");
    } else toast.error("Assignment could not be deleted");
  }
  async function removeQuiz(moduleId: string, quizId: string) {
    const res = await fetch(`/api/admin/quizzes/${quizId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setModules((rows) =>
        rows.map((row) =>
          row.id === moduleId
            ? {
                ...row,
                quizzes: row.quizzes.filter((item) => item.id !== quizId),
              }
            : row,
        ),
      );
      toast.success("Quiz deleted");
    } else toast.error("Quiz could not be deleted");
  }
  function saved(item: any) {
    if (!modal) return;
    if (modal.type === "module")
      setModules((x) =>
        modal.module
          ? x.map((y) =>
              y.id === item.id
                ? { ...y, title: item.title, description: item.description }
                : y,
            )
          : [
              ...x,
              { ...item, courseId, lessons: [], quizzes: [], assignments: [] },
            ],
      );
    else if (modal.module)
      setModules((x) =>
        x.map((y) =>
          y.id === modal.module!.id
            ? {
                ...y,
                [modal.type === "lesson" ? "lessons" : "quizzes"]:
                  modal.type === "lesson" && modal.lesson
                    ? y.lessons.map((lesson) =>
                        lesson.id === item.id ? item : lesson,
                      )
                    : modal.type === "quiz" && modal.quiz
                      ? y.quizzes.map((quiz) =>
                          quiz.id === item.id ? item : quiz,
                        )
                      : [
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
            {readOnly
              ? "View course modules, lessons, quizzes and assignments."
              : "Drag the grip to reorder sections. Lessons and quizzes preview inside each section."}
          </p>
        </div>
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            <BulkImportDialog
              label="Curriculum"
              endpoint="/api/admin/bulk/curriculum"
              extraFields={{ course_id: courseId }}
              template={`module_title,module_description,lesson_title,lesson_type,content_url,description,lesson_position,quiz_title\nIntroduction,Core concepts for new learners,Welcome Video,video,https://example.com/video.mp4,Course introduction,1,Introduction Quiz\nAdvanced Topics,In-depth learning materials,Reading Guide,document,https://example.com/guide.pdf,Download the guide,1,`}
            />
            <button
              onClick={() => setModal({ type: "module" })}
              className="btn-primary gap-2"
            >
              <Plus className="size-4" />
              Add Module
            </button>
          </div>
        )}
      </div>
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt={`${courseTitle} thumbnail`}
          className="mt-7 h-72 w-full rounded-2xl border bg-white object-contain p-2 shadow-sm lg:h-96"
        />
      )}
      {videoUrl && (
        <section className="mx-auto mt-5 w-full max-w-3xl overflow-hidden rounded-2xl border bg-white p-3 shadow-sm sm:p-4">
          {videoSource === "upload" ? (
            <VideoPlayer src={videoUrl} />
          ) : youtubeEmbed(videoUrl) ? (
            <iframe
              src={youtubeEmbed(videoUrl)!}
              title={`${courseTitle} course video`}
              className="aspect-video w-full rounded-xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Course Video
              </p>
              <a
                href={videoUrl}
                target="_blank"
                className="mt-2 block break-all text-sm font-semibold text-blue-600"
              >
                {videoUrl}
              </a>
            </div>
          )}
        </section>
      )}
      <div className="mt-7 space-y-5">
        {visible.map((m) => (
          <section
            draggable={!readOnly}
            onDragStart={() => setDrag(m.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => reorder(m.id)}
            onDragEnd={() => setDrag(null)}
            className={`relative overflow-visible rounded-xl border bg-white ${drag === m.id ? "opacity-50" : ""}`}
            key={m.id}
          >
            <div className="flex items-center gap-4 border-b p-5">
              {!readOnly && (
                <button
                  title="Drag to move section"
                  className="cursor-grab text-slate-400"
                >
                  <GripVertical className="size-6" />
                </button>
              )}
              <span className="grid size-10 place-items-center rounded-lg bg-navy font-bold text-white">
                {m.position}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Module No {m.position}
                </p>
                <h2 className="font-bold text-navy">{m.title}</h2>
                {m.description && (
                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    {m.description}
                  </p>
                )}
                <p className="hidden">
                  {m.lessons.length} lessons · {m.quizzes.length} quizzes
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {m.lessons.length}{" "}
                  {m.lessons.length === 1 ? "lesson" : "lessons"}
                  {" · "}
                  {m.assignments.length}{" "}
                  {m.assignments.length === 1 ? "assignment" : "assignments"}
                  {" · "}
                  {m.quizzes.length}{" "}
                  {m.quizzes.length === 1 ? "quiz" : "quizzes"}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setCollapsedModules((current) => {
                    const next = new Set(current);
                    if (next.has(m.id)) next.delete(m.id);
                    else next.add(m.id);
                    return next;
                  })
                }
                aria-label={
                  collapsedModules.has(m.id)
                    ? `Expand ${m.title}`
                    : `Collapse ${m.title}`
                }
                title={collapsedModules.has(m.id) ? "Expand" : "Collapse"}
                className={`${readOnly ? "ml-auto" : ""} grid size-9 shrink-0 place-items-center rounded-lg border text-slate-500`}
              >
                <ChevronDown
                  className={`size-4 transition-transform ${collapsedModules.has(m.id) ? "-rotate-90" : "rotate-0"}`}
                />
              </button>
              {!readOnly && (
                <div className="relative">
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
                        onClick={() => {
                          setDeleting(m);
                          setMenu(null);
                        }}
                        className="action-row text-red"
                      >
                        <Trash2 />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {!collapsedModules.has(m.id) && (
              <ModuleContent
                readOnly={readOnly}
                module={m}
                courseId={courseId}
                onReplace={(lesson) =>
                  setModal({
                    type: "lesson",
                    module: m,
                    lessonType: lesson.content_type,
                    lesson,
                  })
                }
                onEditQuiz={(quiz) =>
                  setModal({ type: "quiz", module: m, quiz })
                }
                onDeleteLesson={(id) => removeLesson(m.id, id)}
                onDeleteQuiz={(id) => removeQuiz(m.id, id)}
                onDeleteAssignment={(id) => removeAssignment(m.id, id)}
              />
            )}
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
      <ConfirmDialog
        open={!!deleting}
        title="Delete Module?"
        description={`Are you sure you want to delete ${deleting?.title || "this module"} and its lessons? This action cannot be undone.`}
        confirmLabel="Delete Module"
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && remove(deleting)}
      />
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
function LessonActions({
  lesson,
  open,
  onToggle,
  onClose,
  onReplace,
  onDelete,
}: {
  lesson: Lesson;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onReplace: (lesson: Lesson) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="grid size-8 place-items-center rounded-lg border bg-white"
        title="Lesson actions"
      >
        <MoreVertical className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-[120] w-36 rounded-xl border bg-white py-1 shadow-2xl">
          <button
            type="button"
            onClick={() => {
              onReplace(lesson);
              onClose();
            }}
            className="action-row"
          >
            <Upload />
            Replace
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete(lesson.id);
              onClose();
            }}
            className="action-row text-red"
          >
            <Trash2 />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function ModuleContent({
  module,
  courseId,
  onReplace,
  onEditQuiz,
  onDeleteLesson,
  onDeleteQuiz,
  onDeleteAssignment,
  readOnly,
}: {
  module: ModuleRow;
  courseId: string;
  onReplace: (lesson: Lesson) => void;
  onEditQuiz: (quiz: Quiz) => void;
  onDeleteLesson: (id: string) => void;
  onDeleteQuiz: (id: string) => void;
  onDeleteAssignment: (id: string) => void;
  readOnly: boolean;
}) {
  const [cardMenu, setCardMenu] = useState<string | null>(null),
    videos = module.lessons.filter((x) => x.content_type === "video"),
    medium = module.lessons.filter((x) => x.content_type !== "video");
  if (
    !module.lessons.length &&
    !module.quizzes.length &&
    !module.assignments.length
  )
    return (
      <div className="p-5 text-sm text-slate-400">
        No lessons, assignments, or quizzes in this section.
      </div>
    );
  return (
    <div className="space-y-5 p-5">
      {videos.map((x) => (
        <article
          className="max-w-2xl rounded-xl border bg-slate-950"
          key={x.id}
        >
          <div className="overflow-hidden rounded-t-xl bg-white px-4 pt-1">
            <CollapsibleMedia label="Video">
              <VideoPlayer src={x.content_url} />
            </CollapsibleMedia>
          </div>
          <div className="bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <b className="text-navy">{x.title}</b>
              {!readOnly && (
                <LessonActions
                  lesson={x}
                  open={cardMenu === `lesson-${x.id}`}
                  onToggle={() =>
                    setCardMenu(
                      cardMenu === `lesson-${x.id}` ? null : `lesson-${x.id}`,
                    )
                  }
                  onClose={() => setCardMenu(null)}
                  onReplace={onReplace}
                  onDelete={onDeleteLesson}
                />
              )}
            </div>
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
                <CollapsibleMedia label="Audio">
                  <audio controls className="w-full" src={x.content_url} />
                </CollapsibleMedia>
              )}{" "}
              {x.description && (
                <p className="mt-3 text-sm text-slate-500">{x.description}</p>
              )}
              {!readOnly && (
                <div className="mt-3 flex justify-end">
                  <LessonActions
                    lesson={x}
                    open={cardMenu === `lesson-${x.id}`}
                    onToggle={() =>
                      setCardMenu(
                        cardMenu === `lesson-${x.id}` ? null : `lesson-${x.id}`,
                      )
                    }
                    onClose={() => setCardMenu(null)}
                    onReplace={onReplace}
                    onDelete={onDeleteLesson}
                  />
                </div>
              )}
            </article>
          ))}
          {module.quizzes.map((q, quizIndex) => (
            <article
              className={`order-2 rounded-xl border border-violet-100 bg-violet-50 p-4 ${quizIndex === 0 ? "md:col-start-1" : ""}`}
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
                {!readOnly && (
                  <div className="relative ml-auto">
                    <button
                      onClick={() =>
                        setCardMenu(
                          cardMenu === `quiz-${q.id}` ? null : `quiz-${q.id}`,
                        )
                      }
                      className="grid size-8 place-items-center rounded-lg border bg-white"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {cardMenu === `quiz-${q.id}` && (
                      <div className="absolute right-0 top-10 z-[120] w-36 rounded-xl border bg-white py-1 shadow-2xl">
                        <button
                          onClick={() => {
                            onEditQuiz(q);
                            setCardMenu(null);
                          }}
                          className="action-row"
                        >
                          <Edit3 />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onDeleteQuiz(q.id);
                            setCardMenu(null);
                          }}
                          className="action-row text-red"
                        >
                          <Trash2 />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
          {module.assignments.map((a, assignmentIndex) => (
            <article
              className={`order-1 rounded-xl border border-amber-100 bg-amber-50 p-4 ${assignmentIndex === 0 ? "md:col-start-1" : ""}`}
              key={a.id}
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-white text-amber-600">
                  <FileText />
                </span>
                <div className="min-w-0 flex-1">
                  <b className="text-navy">{a.title}</b>
                  <p className="text-xs font-semibold text-amber-600">
                    Assignment
                  </p>
                  <p className="text-xs text-amber-700">
                    Pass Marks: {a.pass_marks} · Deadline:{" "}
                    {new Date(a.due_date).toLocaleDateString()}
                  </p>
                </div>
                {!readOnly && (
                  <div className="relative ml-auto">
                    <button
                      onClick={() =>
                        setCardMenu(
                          cardMenu === `assignment-${a.id}`
                            ? null
                            : `assignment-${a.id}`,
                        )
                      }
                      className="grid size-8 place-items-center rounded-lg border bg-white"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {cardMenu === `assignment-${a.id}` && (
                      <div className="absolute right-0 top-10 z-[120] w-36 rounded-xl border bg-white py-1 shadow-2xl">
                        <a
                          href={`/dashboard/super-admin/courses/${courseId}/curriculum/${module.id}/assignments/${a.id}/edit`}
                          className="action-row"
                        >
                          <Edit3 />
                          Edit
                        </a>
                        <button
                          onClick={() => {
                            onDeleteAssignment(a.id);
                            setCardMenu(null);
                          }}
                          className="action-row text-red"
                        >
                          <Trash2 />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
          ? state.quiz
            ? "Edit Quiz"
            : "Add Quiz"
          : state.lesson
            ? `Replace ${state.lessonType} Lesson`
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
      url = state.lesson
        ? `/api/admin/lessons/${state.lesson.id}`
        : "/api/admin/lessons";
      if (state.lesson) method = "PATCH";
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
          ? state.quiz
            ? `/api/admin/quizzes/${state.quiz.id}`
            : "/api/admin/quizzes"
          : state.module
            ? `/api/admin/modules/${state.module.id}`
            : "/api/admin/modules";
      if (state.type === "module" && state.module) method = "PATCH";
      if (state.type === "quiz" && state.quiz) method = "PATCH";
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
    <div className="fixed inset-0 z-[130] grid place-items-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm sm:p-4">
      <form
        onSubmit={submit}
        className="my-auto max-h-[94dvh] w-full max-w-sm overflow-y-auto rounded-xl bg-white p-4 sm:max-w-lg sm:rounded-2xl sm:p-6"
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
            defaultValue={
              state.type === "module"
                ? state.module?.title
                : state.type === "quiz"
                  ? state.quiz?.title || ""
                  : state.lesson?.title || ""
            }
            className="field mt-2"
            required
          />
        </label>
        {state.type === "module" && (
          <label className="mt-5 block text-sm font-semibold">
            Description
            <textarea
              name="description"
              defaultValue={state.module?.description || ""}
              className="field mt-2 min-h-28"
              placeholder="Enter module description"
            />
          </label>
        )}
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
                required={!state.lesson}
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
              <textarea
                name="description"
                defaultValue={state.lesson?.description || ""}
                className="field mt-2 min-h-28"
              />
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

function youtubeEmbed(url: string) {
  try {
    const parsed = new URL(url),
      id = parsed.hostname.includes("youtu.be")
        ? parsed.pathname.slice(1)
        : parsed.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
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
