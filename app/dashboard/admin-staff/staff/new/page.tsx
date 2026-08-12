import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { InstructorForm } from "@/components/instructor-form";

export default async function NewStaff() {
  const profile = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("organizations")
      .select("id,name")
      .eq("status", "active")
      .order("name");
  return (
    <StaffPageShell name={profile.full_name}>
      <InstructorForm
        organizations={data || []}
        entity="Staff"
        basePath="/dashboard/admin-staff/staff"
        profileRole="admin_staff"
      />
    </StaffPageShell>
  );
}
