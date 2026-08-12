import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import {
  CurriculumManagement,
  type ModuleRow,
} from "@/components/curriculum-management";
export default async function Curriculum({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("super_admin"),
    db = createClient();
  const [{ data: course }, { data }] = await Promise.all([
    db
      .from("courses")
      .select("id,title,thumbnail_url,video_source,video_url")
      .eq("id", params.id)
      .single(),
    db
      .from("course_modules")
      .select(
        "id,title,description,position,lessons(id,title,content_type,content_url,description,position),quizzes(id,title),assignments(id,title,pass_marks,due_date)",
      )
      .eq("course_id", params.id)
      .order("position")
      .order("position", { referencedTable: "lessons" }),
  ]);
  if (!course) notFound();
  const modules: ModuleRow[] = (data || []).map((x: any) => ({
    id: x.id,
    courseId: course.id,
    title: x.title,
    position: x.position,
    lessons: x.lessons || [],
    quizzes: x.quizzes || [],
    assignments: x.assignments || [],
  }));
  return (
    <SuperAdminShell name={profile.full_name}>
      <CurriculumManagement
        courseId={course.id}
        courseTitle={course.title}
        thumbnailUrl={course.thumbnail_url}
        videoSource={course.video_source}
        videoUrl={course.video_url}
        initialModules={modules}
      />
    </SuperAdminShell>
  );
}
