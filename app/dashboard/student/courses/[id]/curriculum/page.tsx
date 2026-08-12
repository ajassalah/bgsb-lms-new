import { notFound } from "next/navigation";
import { BookOpen, ClipboardList, FileAudio, FileText, HelpCircle, Video } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { CourseCurriculumMedia } from "@/components/course-curriculum-media";
import { CollapsibleMedia } from "@/components/collapsible-media";
import { VideoPlayer } from "@/components/video-player";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function StudentCurriculum({ params }: { params: { id: string } }) {
  const profile = await requireProfile("student"), admin = createAdminClient();
  const { data: enrollment } = await admin.from("enrollments").select("id").eq("student_id", profile.id).eq("course_id", params.id).in("status", ["approved", "completed"]).maybeSingle();
  if (!enrollment) notFound();
  const [{ data: course }, { data: modules }] = await Promise.all([
    admin.from("courses").select("title,thumbnail_url,video_source,video_url").eq("id", params.id).single(),
    admin.from("course_modules").select("id,title,description,position,lessons(id,title,content_type,content_url,description,position),quizzes(id,title),assignments(id,title,due_date,max_score,file_url)").eq("course_id", params.id).order("position"),
  ]);
  if (!course) notFound();
  return <DashboardShell role="student" name={profile.full_name} email={profile.email} avatar={profile.avatar_url}>
    <p className="text-sm text-slate-400">My Courses / Curriculum</p><h1 className="mt-1 text-2xl font-bold text-navy">{course.title}</h1>
    <CourseCurriculumMedia title={course.title} thumbnailUrl={course.thumbnail_url} videoSource={course.video_source} videoUrl={course.video_url} />
    <div className="mt-6 space-y-5">{(modules || []).map((module: any) => <section key={module.id} className="rounded-2xl border bg-white p-5">
      <div className="flex items-start gap-3"><BookOpen className="mt-1 text-red" /><div><small>Module {module.position}</small><h2 className="font-bold text-navy">{module.title}</h2>{module.description && <p className="mt-1 text-sm text-slate-500">{module.description}</p>}</div></div>
      <div className="mt-4 space-y-3">{(module.lessons || []).map((lesson: any) => <div key={lesson.id} className="rounded-xl border bg-slate-50 p-4"><b className="flex gap-2">{lesson.content_type === "video" ? <Video className="size-4" /> : lesson.content_type === "audio" ? <FileAudio className="size-4" /> : <FileText className="size-4" />}{lesson.title}</b>{lesson.description && <p className="mt-2 text-sm text-slate-500">{lesson.description}</p>}{lesson.content_type === "video" && lesson.content_url && <CollapsibleMedia label="Video"><div className="max-w-2xl"><VideoPlayer src={lesson.content_url} /></div></CollapsibleMedia>}{lesson.content_type === "audio" && lesson.content_url && <CollapsibleMedia label="Audio"><audio controls src={lesson.content_url} className="w-full" /></CollapsibleMedia>}{lesson.content_type === "document" && lesson.content_url && <a href={lesson.content_url} download className="btn-secondary mt-3 inline-flex">Download Document</a>}</div>)}
        {(module.quizzes || []).map((quiz: any) => <div key={quiz.id} className="flex gap-2 rounded-xl border bg-blue-50 p-4 text-blue-700"><HelpCircle className="size-4" />{quiz.title}</div>)}
        {(module.assignments || []).map((assignment: any) => <article key={assignment.id} className="rounded-xl border bg-slate-50 p-4"><div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-lg bg-white text-amber-600"><ClipboardList className="size-4"/></span><div className="min-w-0 flex-1"><b className="block text-navy">{assignment.title}</b><small className="text-slate-400">Assignment · Due {new Date(assignment.due_date).toLocaleDateString("en-GB")}</small></div>{assignment.file_url&&<a href={`${assignment.file_url}${assignment.file_url.includes("?")?"&":"?"}download=${encodeURIComponent(assignment.title)}`} download className="btn-secondary gap-2"><FileText className="size-4"/>Download</a>}</div></article>)}
      </div>
    </section>)}</div>
  </DashboardShell>;
}
