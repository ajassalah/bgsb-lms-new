import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import {
  CourseAssignmentManagement,
  type AssignmentCourseRow,
} from "@/components/course-assignment-management";
export default async function AssignmentsPage() {
  const profile = await requireProfile("super_admin"),
    { data } = await createClient()
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
    <SuperAdminShell name={profile.full_name}>
      <CourseAssignmentManagement initialRows={rows} />
    </SuperAdminShell>
  );
}
