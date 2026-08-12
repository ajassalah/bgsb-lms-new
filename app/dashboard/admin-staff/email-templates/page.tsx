import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { EmailTemplateManagement } from "@/components/email-template-management";
export default async function Page() {
  const p = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("email_templates")
      .select("id,subject")
      .order("created_at", { ascending: false });
  return (
    <StaffPageShell name={p.full_name}>
      <EmailTemplateManagement initialRows={data || []} />
    </StaffPageShell>
  );
}
