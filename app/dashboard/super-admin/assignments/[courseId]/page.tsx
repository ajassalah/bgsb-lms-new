import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { AssignmentCourseOverview } from "@/components/assignment-course-overview";
export default async function AssignmentCourseView({
  params,
}: {
  params: { courseId: string };
}) {
  const profile = await requireProfile("super_admin"),
    db = createClient();
  const [{ data: course }, { data: modules }, { data: enrollments }] = await Promise.all([
    db
      .from("courses")
      .select("title,thumbnail_url")
      .eq("id", params.courseId)
      .single(),
    db
      .from("course_modules")
      .select(
        "id,title,position,assignments(id,title,pass_marks,max_score,due_date,file_url)",
      )
      .eq("course_id", params.courseId)
      .order("position"),
    db.from("enrollments").select("student:profiles!enrollments_student_id_fkey(id,full_name,email,avatar_url)").eq("course_id", params.courseId).in("status", ["approved", "completed"]),
  ]);
  if (!course) notFound();
  return (
    <SuperAdminShell name={profile.full_name}>
      <AssignmentCourseOverview
        courseId={params.courseId}
        title={course.title}
        thumbnailUrl={course.thumbnail_url}
        initialModules={(modules || []).map((m: any) => ({
          ...m,
          assignments: m.assignments || [],
        }))}
        students={(enrollments || []).map((row: any) => ({ id: row.student?.id, name: row.student?.full_name || "Student", email: row.student?.email || "", avatar: row.student?.avatar_url || null })).filter((x: any) => x.id)}
      />
    </SuperAdminShell>
  );
}
