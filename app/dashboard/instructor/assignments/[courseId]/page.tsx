import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { AssignmentCourseOverview } from "@/components/assignment-course-overview";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function InstructorAssignmentOverview({ params }: { params: { courseId: string } }) {
  const profile = await requireProfile("instructor"), admin = createAdminClient();
  const { data: access } = await admin.from("course_instructors").select("course_id").eq("course_id", params.courseId).eq("instructor_id", profile.id).maybeSingle();
  if (!access) notFound();
  const [{ data: course }, { data: modules }, { data: enrollments }] = await Promise.all([
    admin.from("courses").select("title,thumbnail_url").eq("id", params.courseId).single(),
    admin.from("course_modules").select("id,title,position,assignments(id,title,pass_marks,max_score,due_date,file_url)").eq("course_id", params.courseId).order("position"),
    admin.from("enrollments").select("student:profiles!enrollments_student_id_fkey(id,full_name,email,avatar_url)").eq("course_id", params.courseId).in("status", ["approved", "completed"]),
  ]);
  if (!course) notFound();
  return <DashboardShell role="instructor" name={profile.full_name}><AssignmentCourseOverview courseId={params.courseId} title={course.title} thumbnailUrl={course.thumbnail_url} initialModules={(modules || []).map((m: any) => ({ ...m, assignments: m.assignments || [] }))} students={(enrollments || []).map((row: any) => ({ id: row.student?.id, name: row.student?.full_name || "Student", email: row.student?.email || "", avatar: row.student?.avatar_url || null })).filter((x: any) => x.id)} basePath="/dashboard/instructor/assignments" readOnly /></DashboardShell>;
}
