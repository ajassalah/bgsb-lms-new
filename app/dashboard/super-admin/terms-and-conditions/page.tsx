import { SuperAdminShell } from "@/components/super-admin-shell";
import { TermsManagementContent } from "@/components/terms-management-content";
import { requireProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SuperAdminTermsPage() {
  const profile = await requireProfile("super_admin");
  return (
    <SuperAdminShell name={profile.full_name}>
      <TermsManagementContent />
    </SuperAdminShell>
  );
}
