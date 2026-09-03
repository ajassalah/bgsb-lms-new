import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import {
  CurriculumManagement,
  type ModuleRow,
} from "@/components/curriculum-management";
import { staffCan } from "@/lib/staff-permissions";
import { loadCurriculumModules } from "@/lib/curriculum-modules";
export default async function Curriculum({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("admin_staff"),
    db = createAdminClient();
  const fullAccess = await staffCan(
    profile.id,
    "curriculum_overview",
    "full_access",
  );
  const [{ data: course }, moduleResult] = await Promise.all([
    db
      .from("courses")
      .select("id,title,thumbnail_url,video_source,video_url")
      .eq("id", params.id)
      .single(),
    loadCurriculumModules(db, params.id),
  ]);
  if (!course) notFound();
  const data = moduleResult.data || [];
  const modules: ModuleRow[] = (data || []).map((x: any) => ({
    id: x.id,
    courseId: course.id,
    title: x.title,
    description: x.description,
    position: x.position,
    lessons: x.lessons || [],
    quizzes: x.quizzes || [],
    assignments: x.assignments || [],
  }));
  return (
    <StaffPageShell name={profile.full_name}>
      <CurriculumManagement
        courseId={course.id}
        courseTitle={course.title}
        thumbnailUrl={course.thumbnail_url}
        videoSource={course.video_source}
        videoUrl={course.video_url}
        initialModules={modules}
        readOnly={!fullAccess}
      />
    </StaffPageShell>
  );
}
