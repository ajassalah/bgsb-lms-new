import { HelpSupportContent } from "@/components/help-support-content";
import { StaffPageShell } from "@/components/staff-page-shell";

export const dynamic = "force-dynamic";

export default async function StaffHelpPage() {
  return (
    <StaffPageShell>
      <HelpSupportContent basePath="/dashboard/admin-staff/support" />
    </StaffPageShell>
  );
}
