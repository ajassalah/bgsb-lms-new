import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { EmailTemplateForm } from "@/components/email-template-form";
export default async function Page({ params }: { params: { id: string } }) {
  const p = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("email_templates")
      .select("id,subject,body,attachment_name,attachment_url")
      .eq("id", params.id)
      .single();
  if (!data) notFound();
  return (
    <StaffPageShell name={p.full_name}>
      <EmailTemplateForm template={data} />
    </StaffPageShell>
  );
}
