import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { EmailTemplateManagement } from "@/components/email-template-management";
export default async function Page() {
  const p = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("email_templates")
      .select("id,subject")
      .order("created_at", { ascending: false });
  return (
    <SuperAdminShell name={p.full_name}>
      <EmailTemplateManagement initialRows={data || []} />
    </SuperAdminShell>
  );
}
