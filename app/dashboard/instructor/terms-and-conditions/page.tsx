import { DashboardShell } from "@/components/dashboard-shell";
import { PublishedTermsContent } from "@/components/published-terms-content";
import { requireProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function InstructorTermsPage() {
  const profile = await requireProfile("instructor");
  return (
    <DashboardShell
      role="instructor"
      name={profile.full_name}
      email={profile.email}
      avatar={profile.avatar_url}
    >
      <PublishedTermsContent />
    </DashboardShell>
  );
}
