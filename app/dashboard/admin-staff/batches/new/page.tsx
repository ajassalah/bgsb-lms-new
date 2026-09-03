import { StaffPageShell } from "@/components/staff-page-shell";
import { BatchFormContent } from "@/components/intake-batch-page-content";
export default function Page() {
  return (
    <StaffPageShell>
      <BatchFormContent basePath="/dashboard/admin-staff/batches" />
    </StaffPageShell>
  );
}
