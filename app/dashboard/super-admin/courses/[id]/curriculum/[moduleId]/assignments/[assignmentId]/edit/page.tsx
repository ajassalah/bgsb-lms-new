import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { AssignmentForm } from "@/components/assignment-form";
export default async function EditAssignment({
  params,
}: {
  params: { id: string; moduleId: string; assignmentId: string };
}) {
  const profile = await requireProfile("super_admin"),
    db = createClient();
  const [{ data: assignment }, { data: instructors }] = await Promise.all([
    db
      .from("assignments")
      .select(
        "id,title,due_date,instructor_id,pass_marks,max_score,description,file_url",
      )
      .eq("id", params.assignmentId)
      .eq("module_id", params.moduleId)
      .single(),
    db
      .from("profiles")
      .select("id,full_name")
      .eq("role", "instructor")
      .eq("status", "active")
      .order("full_name"),
  ]);
  if (!assignment) notFound();
  return (
    <SuperAdminShell name={profile.full_name}>
      <AssignmentForm
        courseId={params.id}
        moduleId={params.moduleId}
        assignment={{
          ...assignment,
          description: assignment.description || "",
        }}
        instructors={(instructors || []).map((x) => ({
          id: x.id,
          name: x.full_name,
        }))}
      />
    </SuperAdminShell>
  );
}
