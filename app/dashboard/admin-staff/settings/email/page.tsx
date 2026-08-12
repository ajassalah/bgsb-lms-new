import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { EmailConfigurationForm } from "@/components/email-configuration-form";
export default async function Page() {
  const p = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("email_configuration")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
  return (
    <StaffPageShell name={p.full_name}>
      <EmailConfigurationForm value={data} />
    </StaffPageShell>
  );
}
