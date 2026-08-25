import { StaffPageShell } from "@/components/staff-page-shell";
import { ClassSectionPage } from "@/components/class-section-page";
export default function Page() {
  return (
    <StaffPageShell>
      <ClassSectionPage section="dashboard" />
    </StaffPageShell>
  );
}
