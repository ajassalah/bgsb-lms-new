import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  BookOpen,
  ChevronDown,
  ClipboardList,
  FileAudio,
  FileText,
  HelpCircle,
  Video,
} from "lucide-react";
import { VideoPlayer } from "@/components/video-player";
import { CourseCurriculumMedia } from "@/components/course-curriculum-media";
import { CollapsibleMedia } from "@/components/collapsible-media";
import { QuizQuestionDisplay } from "@/components/quiz-question-display";
import { loadCurriculumModules } from "@/lib/curriculum-modules";

export default async function InstructorCurriculum({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("instructor"),
    admin = createAdminClient();
  const { data: assignment } = await admin
    .from("course_instructors")
    .select("course_id")
    .eq("course_id", params.id)
    .eq("instructor_id", profile.id)
    .maybeSingle();
  if (!assignment) notFound();
  const [{ data: course }, moduleResult] = await Promise.all([
    admin
      .from("courses")
      .select("title,thumbnail_url,video_source,video_url")
      .eq("id", params.id)
      .single(),
    loadCurriculumModules(admin, params.id),
  ]);
  if (!course) notFound();
  const modules = moduleResult.data || [];
  return (
    <DashboardShell
      role="instructor"
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
      <p className="text-sm text-slate-400">My Courses / Curriculum</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">{course.title}</h1>
      <div className="mt-6 space-y-5">
        {(modules || []).map((module: any, moduleIndex: number) => (
          <details
            key={module.id}
            open={moduleIndex === 0}
            className="group overflow-hidden rounded-2xl border bg-white shadow-sm"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
              <span className="grid size-10 place-items-center rounded-xl bg-red/10 text-red">
                <BookOpen className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <small className="text-slate-400">
                  Module {moduleIndex + 1}
                </small>
                <h2 className="font-bold text-navy">{module.title}</h2>
                {module.description && (
                  <p className="mt-1 text-sm text-slate-500">
                    {module.description}
                  </p>
                )}
              </div>
              <ChevronDown className="size-5 transition group-open:rotate-180" />
            </summary>
            <div className="grid gap-3 border-t p-5">
              {(module.lessons || [])
                .sort((a: any, b: any) => a.position - b.position)
                .map((lesson: any) => (
                  <div
                    key={lesson.id}
                    className="rounded-xl border bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-2 font-semibold text-navy">
                      {lesson.content_type === "video" ? (
                        <Video className="size-4" />
                      ) : lesson.content_type === "audio" ? (
                        <FileAudio className="size-4" />
                      ) : (
                        <FileText className="size-4" />
                      )}
                      {lesson.title}
                    </div>
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
                          className="w-full max-w-xl"
                        />
                      </CollapsibleMedia>
                    )}
                    {lesson.content_type === "document" &&
                      lesson.content_url && (
                        <div className="mt-3 flex justify-end">
                          <a
                            href={lesson.content_url}
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
                  className="flex items-center gap-2 rounded-xl border bg-blue-50 p-4 font-semibold text-blue-700"
                >
                  <HelpCircle className="size-4" />
                  <div className="min-w-0 flex-1">
                    <b className="block">{quiz.title}</b>
                    <small>Quiz</small>
                    <QuizQuestionDisplay
                      quizId={quiz.id}
                      title={quiz.title}
                      questions={quiz.quiz_questions}
                    />
                  </div>
                  <a
                    href={`data:text/plain;charset=utf-8,${encodeURIComponent(`Quiz: ${quiz.title}`)}`}
                    download={`${quiz.title}.txt`}
                    className="btn-secondary ml-auto"
                  >
                    Download
                  </a>
                </div>
              ))}
              {(module.assignments || []).map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border bg-amber-50 p-4"
                >
                  <ClipboardList className="size-4 text-amber-600" />
                  <div className="min-w-0 flex-1">
                    <b className="block text-navy">{item.title}</b>
                    <small className="text-amber-600">Assignment</small>
                  </div>
                  {item.file_url && (
                    <a
                      href={item.file_url}
                      download
                      className="btn-secondary ml-auto"
                    >
                      Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          </details>
        ))}
        {!modules?.length && (
          <div className="rounded-2xl border bg-white p-10 text-center text-slate-400">
            No curriculum modules available.
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
