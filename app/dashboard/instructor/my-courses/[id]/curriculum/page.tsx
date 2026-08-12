import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { BookOpen, FileAudio, FileText, HelpCircle, Video } from "lucide-react";
import { VideoPlayer } from "@/components/video-player";
import { CourseCurriculumMedia } from "@/components/course-curriculum-media";
import { CollapsibleMedia } from "@/components/collapsible-media";

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
  const [{ data: course }, { data: modules }] = await Promise.all([
    admin
      .from("courses")
      .select("title,thumbnail_url,video_source,video_url")
      .eq("id", params.id)
      .single(),
    admin
      .from("course_modules")
      .select(
        "id,title,description,position,lessons(id,title,content_type,content_url,description,position),quizzes(id,title),assignments(id,title,pass_marks,due_date)",
      )
      .eq("course_id", params.id)
      .order("position"),
  ]);
  if (!course) notFound();
  return (
    <DashboardShell role="instructor" name={profile.full_name}>
      <p className="text-sm text-slate-400">My Courses / Curriculum</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">{course.title}</h1>
      <CourseCurriculumMedia title={course.title} thumbnailUrl={course.thumbnail_url} videoSource={course.video_source} videoUrl={course.video_url} />
      <div className="mt-6 space-y-5">
        {(modules || []).map((module: any) => (
          <section
            key={module.id}
            className="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-red/10 text-red">
                <BookOpen className="size-5" />
              </span>
              <div>
                <small className="text-slate-400">
                  Module {module.position}
                </small>
                <h2 className="font-bold text-navy">{module.title}</h2>
                {module.description && <p className="mt-1 text-sm text-slate-500">{module.description}</p>}
              </div>
            </div>
            <div className="mt-4 grid gap-3">
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
                    {lesson.description && (
                      <p className="mt-2 text-sm text-slate-500">
                        {lesson.description}
                      </p>
                    )}
                    {lesson.content_type === "video" && lesson.content_url && (
                      <CollapsibleMedia label="Video"><div className="max-w-2xl"><VideoPlayer src={lesson.content_url} /></div></CollapsibleMedia>
                    )}
                    {lesson.content_type === "audio" && lesson.content_url && (
                      <CollapsibleMedia label="Audio"><audio controls src={lesson.content_url} className="w-full max-w-xl" /></CollapsibleMedia>
                    )}
                    {lesson.content_type === "document" &&
                      lesson.content_url && (
                        <a
                          href={lesson.content_url}
                          download
                          className="btn-secondary mt-3 inline-flex"
                        >
                          Download Document
                        </a>
                      )}
                  </div>
                ))}
              {(module.quizzes || []).map((quiz: any) => (
                <div
                  key={quiz.id}
                  className="flex items-center gap-2 rounded-xl border bg-blue-50 p-4 font-semibold text-blue-700"
                >
                  <HelpCircle className="size-4" />
                  {quiz.title}
                </div>
              ))}
            </div>
          </section>
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
