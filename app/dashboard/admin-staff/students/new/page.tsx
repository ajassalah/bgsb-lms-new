import { requireProfile } from "@/lib/auth";
import { StaffPageShell } from "@/components/staff-page-shell";
import { StudentForm } from "@/components/student-form";
export default async function AddStudent() {
  const profile = await requireProfile("admin_staff");
  return (
    <StaffPageShell name={profile.full_name}>
      <StudentForm />
    </StaffPageShell>
  );
}
