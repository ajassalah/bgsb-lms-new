import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { ChangePasswordForm } from "@/components/change-password-form";
export default async function Page() {
  const p = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("profiles")
      .select("email,avatar_url")
      .eq("id", p.id)
      .single();
  return (
    <SuperAdminShell name={p.full_name}>
      <ChangePasswordForm
        email={data!.email}
        avatar={data!.avatar_url}
        name={p.full_name}
      />
    </SuperAdminShell>
  );
}
