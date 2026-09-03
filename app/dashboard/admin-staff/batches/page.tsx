import { StaffPageShell } from "@/components/staff-page-shell";
import { BatchListContent } from "@/components/intake-batch-page-content";
export default function Page() {
  return (
    <StaffPageShell>
      <BatchListContent basePath="/dashboard/admin-staff/batches" />
    </StaffPageShell>
  );
}
