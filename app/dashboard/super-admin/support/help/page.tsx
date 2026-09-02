import { HelpSupportContent } from "@/components/help-support-content";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { requireProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SuperAdminHelpPage() {
  const profile = await requireProfile("super_admin");
  return (
    <SuperAdminShell name={profile.full_name}>
      <HelpSupportContent basePath="/dashboard/super-admin/support" />
    </SuperAdminShell>
  );
}
