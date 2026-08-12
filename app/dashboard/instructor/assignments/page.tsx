import { DashboardShell } from "@/components/dashboard-shell";
import { CourseAssignmentManagement, type AssignmentCourseRow } from "@/components/course-assignment-management";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function InstructorAssignmentsPage() {
  const profile = await requireProfile("instructor"), admin = createAdminClient();
  const { data: links } = await admin.from("course_instructors").select("course_id").eq("instructor_id", profile.id);
  const ids = (links || []).map((x) => x.course_id);
  const { data } = ids.length ? await admin.from("courses").select("id,title,assignments(count)").in("id", ids).neq("status", "archived").order("title") : { data: [] };
  const rows: AssignmentCourseRow[] = (data || []).map((x: any) => ({ id: x.id, title: x.title, assignmentCount: x.assignments?.[0]?.count || 0 }));
  return <DashboardShell role="instructor" name={profile.full_name}><CourseAssignmentManagement initialRows={rows} basePath="/dashboard/instructor/assignments" /></DashboardShell>;
}
