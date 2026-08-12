import { DashboardShell } from "@/components/dashboard-shell";
import { AdminProfileForm } from "@/components/admin-profile-form";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function StaffProfile() {
  const p = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("profiles")
      .select(
        "first_name,last_name,email,phone,phone_country_code,address,avatar_url",
      )
      .eq("id", p.id)
      .single();
  return (
    <DashboardShell
      role="admin_staff"
      name={p.full_name}
      email={p.email}
      avatar={p.avatar_url}
    >
      <AdminProfileForm value={data!} />
    </DashboardShell>
  );
}
