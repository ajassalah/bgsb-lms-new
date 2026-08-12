import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { AssignmentForm } from "@/components/assignment-form";
export default async function NewAssignment({
  params,
}: {
  params: { id: string; moduleId: string };
}) {
  const profile = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("profiles")
      .select("id,full_name")
      .eq("role", "instructor")
      .eq("status", "active")
      .order("full_name");
  return (
    <StaffPageShell name={profile.full_name}>
      <AssignmentForm
        courseId={params.id}
        moduleId={params.moduleId}
        instructors={(data || []).map((x) => ({ id: x.id, name: x.full_name }))}
      />
    </StaffPageShell>
  );
}
