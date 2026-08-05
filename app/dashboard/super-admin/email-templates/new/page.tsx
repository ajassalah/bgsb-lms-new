import { requireProfile } from "@/lib/auth";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { EmailTemplateForm } from "@/components/email-template-form";
export default async function Page() {
  const p = await requireProfile("super_admin");
  return (
    <SuperAdminShell name={p.full_name}>
      <EmailTemplateForm />
    </SuperAdminShell>
  );
}
