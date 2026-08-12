import { DashboardShell } from "@/components/dashboard-shell";
import { AdminProfileForm } from "@/components/admin-profile-form";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function InstructorProfile() {
  const profile = await requireProfile("instructor"),
    { data } = await createAdminClient()
      .from("profiles")
      .select(
        "first_name,last_name,email,phone,phone_country_code,address,avatar_url",
      )
      .eq("id", profile.id)
      .single();
  return (
    <DashboardShell role="instructor" name={profile.full_name}>
      <AdminProfileForm value={data!} />
    </DashboardShell>
  );
}
