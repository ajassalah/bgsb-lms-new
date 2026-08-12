import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import {
  CourseAssignmentManagement,
  type AssignmentCourseRow,
} from "@/components/course-assignment-management";
export default async function AssignmentsPage() {
  const profile = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("courses")
      .select("id,title,assignments(count)")
      .neq("status", "archived")
      .order("title");
  const rows: AssignmentCourseRow[] = (data || []).map((x: any) => ({
    id: x.id,
    title: x.title,
    assignmentCount: x.assignments?.[0]?.count || 0,
  }));
  return (
    <StaffPageShell name={profile.full_name}>
      <CourseAssignmentManagement initialRows={rows} />
    </StaffPageShell>
  );
}
