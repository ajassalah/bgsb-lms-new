import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { EmailTemplateForm } from "@/components/email-template-form";
export default async function Page({ params }: { params: { id: string } }) {
  const p = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("email_templates")
      .select("id,subject,body,attachment_name,attachment_url")
      .eq("id", params.id)
      .single();
  if (!data) notFound();
  return (
    <SuperAdminShell name={p.full_name}>
      <EmailTemplateForm template={data} />
    </SuperAdminShell>
  );
}
