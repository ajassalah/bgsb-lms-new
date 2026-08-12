import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { AssignmentStudentOverview } from "@/components/assignment-student-overview";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadAssignmentStudent } from "@/lib/assignment-student";

export default async function InstructorAssignmentStudentPage({ params }: { params: { courseId: string; studentId: string } }) {
  const profile = await requireProfile("instructor"), admin = createAdminClient();
  const { data: access } = await admin.from("course_instructors").select("course_id").eq("course_id", params.courseId).eq("instructor_id", profile.id).maybeSingle();
  if (!access) notFound();
  const view = await loadAssignmentStudent(params.courseId, params.studentId);
  if (!view) notFound();
  return <DashboardShell role="instructor" name={profile.full_name}><AssignmentStudentOverview {...view} courseId={params.courseId} studentId={params.studentId} basePath="/dashboard/instructor/assignments" /></DashboardShell>;
}
