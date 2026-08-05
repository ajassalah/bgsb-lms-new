import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { EmailConfigurationForm } from "@/components/email-configuration-form";
export default async function Page() {
  const p = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("email_configuration")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
  return (
    <SuperAdminShell name={p.full_name}>
      <EmailConfigurationForm value={data} />
    </SuperAdminShell>
  );
}
