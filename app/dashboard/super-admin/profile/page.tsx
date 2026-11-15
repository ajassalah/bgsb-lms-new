import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { AdminProfileForm } from "@/components/admin-profile-form";
export default async function Page() {
  const p = await requireProfile("super_admin"),
    { data } = await createAdminClient()
      .from("profiles")
      .select(
        "first_name,last_name,email,phone,phone_country_code,address,avatar_url",
      )
      .eq("id", p.id)
      .maybeSingle();
  return (
    <SuperAdminShell name={p.full_name}>
      <AdminProfileForm value={data} fallback={{ email: p.email ?? "", avatar_url: p.avatar_url ?? null }} />
    </SuperAdminShell>
  );
}
