import { StaffPageShell } from "@/components/staff-page-shell";
import { BatchViewContent } from "@/components/intake-batch-page-content";
export default function Page({ params }: { params: { id: string } }) {
  return (
    <StaffPageShell>
      <BatchViewContent
        id={params.id}
        basePath="/dashboard/admin-staff/batches"
      />
    </StaffPageShell>
  );
}
