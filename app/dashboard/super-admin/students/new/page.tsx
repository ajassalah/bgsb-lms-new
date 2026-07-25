import { requireProfile } from "@/lib/auth";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { StudentForm } from "@/components/student-form";
export default async function AddStudent() {
  const profile = await requireProfile("super_admin");
  return (
    <SuperAdminShell name={profile.full_name}>
      <StudentForm />
    </SuperAdminShell>
  );
}
