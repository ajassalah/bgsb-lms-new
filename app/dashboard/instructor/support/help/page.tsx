import { DashboardShell } from "@/components/dashboard-shell";
import { HelpSupportContent } from "@/components/help-support-content";
import { requireProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function InstructorHelpPage() {
  const profile = await requireProfile("instructor");
  return (
    <DashboardShell
      role="instructor"
      name={profile.full_name}
      email={profile.email}
      avatar={profile.avatar_url}
    >
      <HelpSupportContent basePath="/dashboard/instructor/support" />
    </DashboardShell>
  );
}
