import { StaffPageShell } from "@/components/staff-page-shell";
import { TermsManagementContent } from "@/components/terms-management-content";
import { PublishedTermsContent } from "@/components/published-terms-content";
import { requireProfile } from "@/lib/auth";
import { staffCan } from "@/lib/staff-permissions";

export const dynamic = "force-dynamic";

export default async function StaffTermsPage() {
  const profile = await requireProfile("admin_staff");
  const canEdit = await staffCan(profile.id, "terms_conditions", "access");
  return (
    <StaffPageShell>
      {canEdit ? <TermsManagementContent /> : <PublishedTermsContent />}
    </StaffPageShell>
  );
}
