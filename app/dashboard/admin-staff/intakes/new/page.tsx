import { StaffPageShell } from "@/components/staff-page-shell";
import { IntakeFormContent } from "@/components/intake-batch-page-content";
export default function Page() {
  return (
    <StaffPageShell>
      <IntakeFormContent basePath="/dashboard/admin-staff/intakes" />
    </StaffPageShell>
  );
}
