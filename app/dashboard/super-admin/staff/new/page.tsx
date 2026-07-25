import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { InstructorForm } from "@/components/instructor-form";

export default async function NewStaff() {
  const profile = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("organizations")
      .select("id,name")
      .eq("status", "active")
      .order("name");
  return (
    <SuperAdminShell name={profile.full_name}>
      <InstructorForm
        organizations={data || []}
        entity="Staff"
        basePath="/dashboard/super-admin/staff"
        profileRole="admin_staff"
      />
    </SuperAdminShell>
  );
}
