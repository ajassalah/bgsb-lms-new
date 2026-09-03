import { StaffPageShell } from "@/components/staff-page-shell";
import { IntakeViewContent } from "@/components/intake-batch-page-content";
export default function Page({ params }: { params: { id: string } }) {
  return (
    <StaffPageShell>
      <IntakeViewContent
        id={params.id}
        basePath="/dashboard/admin-staff/intakes"
      />
    </StaffPageShell>
  );
}
