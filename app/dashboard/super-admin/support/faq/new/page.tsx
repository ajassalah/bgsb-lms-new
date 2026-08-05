import { requireProfile } from "@/lib/auth";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { SupportFaqForm } from "@/components/support-faq-form";

export default async function NewFaqPage() {
  const profile = await requireProfile("super_admin");
  return (
    <SuperAdminShell name={profile.full_name}>
      <SupportFaqForm />
    </SuperAdminShell>
  );
}
