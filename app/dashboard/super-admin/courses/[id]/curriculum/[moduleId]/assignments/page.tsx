import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import {
  AssignmentManagement,
  type AssignmentRow,
} from "@/components/assignment-management";

export default async function Assignments({
  params,
}: {
  params: { id: string; moduleId: string };
}) {
  const profile = await requireProfile("super_admin"),
    db = createClient();
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
  const rows: AssignmentRow[] = (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    instructor: row.instructor?.full_name || "Not assigned",
    passMarks: row.pass_marks || 0,
    totalMarks: row.max_score || 100,
    deadline: row.due_date,
    fileUrl: row.file_url || null,
  }));
  return (
    <SuperAdminShell name={profile.full_name}>
      <AssignmentManagement
        courseId={params.id}
        moduleId={params.moduleId}
        courseTitle={course.title}
        moduleTitle={module.title}
        initialRows={rows}
      />
    </SuperAdminShell>
  );
}
