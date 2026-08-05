import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { AdminProfileForm } from "@/components/admin-profile-form";
export default async function Page() {
  const p = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("profiles")
      .select(
        "first_name,last_name,email,phone,phone_country_code,address,avatar_url",
      )
      .eq("id", p.id)
      .single();
  return (
    <SuperAdminShell name={p.full_name}>
      <AdminProfileForm value={data!} />
    </SuperAdminShell>
  );
}
