import { StaffPageShell } from "@/components/staff-page-shell";
import { BatchFormContent } from "@/components/intake-batch-page-content";
export default function Page({ params }: { params: { id: string } }) {
  return (
    <StaffPageShell>
      <BatchFormContent
        id={params.id}
        basePath="/dashboard/admin-staff/batches"
      />
    </StaffPageShell>
  );
}
