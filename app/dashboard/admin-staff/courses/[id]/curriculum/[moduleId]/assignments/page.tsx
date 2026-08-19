import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import {
  AssignmentManagement,
  type AssignmentRow,
} from "@/components/assignment-management";
export default async function Assignments({
  params,
}: {
  params: { id: string; moduleId: string };
}) {
  const profile = await requireProfile("admin_staff"),
    db = createAdminClient();
  const [{ data: course }, { data: module }, { data }] = await Promise.all([
    db.from("courses").select("title").eq("id", params.id).single(),
    db
      .from("course_modules")
      .select("title")
      .eq("id", params.moduleId)
      .single(),
    db
      .from("assignments")
      .select(
        "id,title,pass_marks,max_score,due_date,file_url,instructor:profiles!assignments_instructor_id_fkey(full_name)",
      )
      .eq("module_id", params.moduleId)
      .order("created_at", { ascending: false }),
  ]);
  if (!course || !module) notFound();
  const rows: AssignmentRow[] = (data || []).map((x: any) => ({
    id: x.id,
    title: x.title,
    instructor: x.instructor?.full_name || "Not assigned",
    passMarks: x.pass_marks || 0,
    totalMarks: x.max_score || 100,
    deadline: x.due_date,
    fileUrl: x.file_url || null,
  }));
  return (
    <StaffPageShell name={profile.full_name}>
      <AssignmentManagement
        courseId={params.id}
        moduleId={params.moduleId}
        courseTitle={course.title}
        moduleTitle={module.title}
        initialRows={rows}
        basePath="/dashboard/admin-staff"
      />
    </StaffPageShell>
  );
}
