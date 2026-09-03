import { StaffPageShell } from "@/components/staff-page-shell";
import { IntakeListContent } from "@/components/intake-batch-page-content";
export default function Page() {
  return (
    <StaffPageShell>
      <IntakeListContent basePath="/dashboard/admin-staff/intakes" />
    </StaffPageShell>
  );
}
