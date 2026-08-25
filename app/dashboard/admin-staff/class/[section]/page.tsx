import { notFound } from "next/navigation";
import { StaffPageShell } from "@/components/staff-page-shell";
import {
  ClassSectionPage,
  type ClassSection,
} from "@/components/class-section-page";
const valid = ["attendance", "students", "instructors", "classes", "reports"];
export default function Page({ params }: { params: { section: string } }) {
  if (!valid.includes(params.section)) notFound();
  return (
    <StaffPageShell>
      <ClassSectionPage section={params.section as ClassSection} />
    </StaffPageShell>
  );
}
