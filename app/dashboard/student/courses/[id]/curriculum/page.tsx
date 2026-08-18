import { notFound } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  ClipboardList,
  FileAudio,
  FileText,
  HelpCircle,
  Video,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { CourseCurriculumMedia } from "@/components/course-curriculum-media";
import { CollapsibleMedia } from "@/components/collapsible-media";
import { VideoPlayer } from "@/components/video-player";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StudentCurriculum({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("student"),
    admin = createAdminClient();
  const { data: enrollment } = await admin
    .from("enrollments")
    .select("id")
    .eq("student_id", profile.id)
    .eq("course_id", params.id)
    .in("status", ["approved", "completed"])
    .maybeSingle();
  if (!enrollment) notFound();
  const [{ data: course }, { data: modules }] = await Promise.all([
    admin
      .from("courses")
      .select("title,thumbnail_url,video_source,video_url")
      .eq("id", params.id)
      .single(),
    admin
      .from("course_modules")
      .select(
        "id,title,description,position,lessons(id,title,content_type,content_url,description,position),quizzes(id,title),assignments(id,title,due_date,max_score,file_url)",
      )
      .eq("course_id", params.id)
      .order("position"),
  ]);
  if (!course) notFound();
  return (
    <DashboardShell
      role="student"
      name={profile.full_name}
      email={profile.email}
      avatar={profile.avatar_url}
    >
      <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border bg-white p-2 shadow-sm">
        <div className="relative h-48 overflow-hidden rounded-xl bg-slate-100 sm:h-80">
          <img
            src={course.thumbnail_url || "/Thumimage.jpeg"}
            alt={`${course.title} thumbnail`}
            className="size-full object-fill"
          />
        </div>
      </section>
      <CourseCurriculumMedia
        title={course.title}
        thumbnailUrl={null}
        videoSource={course.video_source}
        videoUrl={course.video_url}
      />
      <p className="mt-7 text-sm text-slate-400">My Courses / Curriculum</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">{course.title}</h1>
      <div className="mt-6 space-y-5">
        {(modules || []).map((module: any, moduleIndex: number) => (
          <details
            key={module.id}
            open={moduleIndex === 0}
            className="group overflow-hidden rounded-2xl border bg-white"
          >
            <summary className="flex cursor-pointer list-none items-start gap-3 p-5 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
              <BookOpen className="mt-1 text-red" />
              <div className="min-w-0 flex-1">
                <small>Module {module.position}</small>
                <h2 className="font-bold text-navy">{module.title}</h2>
                {module.description && (
                  <p className="mt-1 text-sm text-slate-500">
                    {module.description}
                  </p>
                )}
              </div>
              <span className="mt-1 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold text-slate-500">
                <span className="group-open:hidden">Expand</span>
                <span className="hidden group-open:inline">Collapse</span>
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
              </span>
            </summary>
            <div className="space-y-3 border-t px-5 pb-5 pt-4">
              {(module.lessons || []).map((lesson: any) => (
                <div
                  key={lesson.id}
                  className="rounded-xl border bg-slate-50 p-4"
                >
                  <b className="flex gap-2">
                    {lesson.content_type === "video" ? (
                      <Video className="size-4" />
                    ) : lesson.content_type === "audio" ? (
                      <FileAudio className="size-4" />
                    ) : (
                      <FileText className="size-4" />
                    )}
                    {lesson.title}
                  </b>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    Lesson
                  </p>
                  {lesson.description && (
                    <p className="mt-2 text-sm text-slate-500">
                      {lesson.description}
                    </p>
                  )}
                  {lesson.content_type === "video" && lesson.content_url && (
                    <CollapsibleMedia label="Video">
                      <div className="max-w-2xl">
                        <VideoPlayer src={lesson.content_url} />
                      </div>
                    </CollapsibleMedia>
                  )}
                  {lesson.content_type === "audio" && lesson.content_url && (
                    <CollapsibleMedia label="Audio">
                      <audio
                        controls
                        src={lesson.content_url}
                        className="w-full"
                      />
                    </CollapsibleMedia>
                  )}
                  {lesson.content_type === "document" && lesson.content_url && (
                    <div className="mt-3 flex justify-end">
                      <a
                        href={`/api/student/lessons/${lesson.id}/download`}
                        download
                        className="btn-secondary inline-flex"
                      >
                        Download Document
                      </a>
                    </div>
                  )}
                </div>
              ))}
              {(module.quizzes || []).map((quiz: any) => (
                <div
                  key={quiz.id}
                  className="flex gap-2 rounded-xl border bg-blue-50 p-4 text-blue-700"
                >
                  <HelpCircle className="mt-0.5 size-4" />
                  <div>
                    <b className="block">{quiz.title}</b>
                    <p className="mt-1 text-xs font-semibold text-blue-500">
                      Quiz
                    </p>
                  </div>
                </div>
              ))}
              {(module.assignments || []).map((assignment: any) => (
                <article
                  key={assignment.id}
                  className="rounded-xl border bg-slate-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 place-items-center rounded-lg bg-white text-amber-600">
                      <ClipboardList className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <b className="block text-navy">{assignment.title}</b>
                      <p className="mt-1 text-xs font-semibold text-amber-600">
                        Assignment
                      </p>
                      <small className="text-slate-400">
                        Due{" "}
                        {new Date(assignment.due_date).toLocaleDateString(
                          "en-GB",
                        )}
                      </small>
                    </div>
                    {assignment.file_url && (
                      <a
                        href={`${assignment.file_url}${assignment.file_url.includes("?") ? "&" : "?"}download=${encodeURIComponent(assignment.title)}`}
                        download
                        className="btn-secondary gap-2"
                      >
                        <FileText className="size-4" />
                        Download
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </details>
        ))}
      </div>
    </DashboardShell>
  );
}
