import { requireProfile } from "@/lib/auth";
import { StaffPageShell } from "@/components/staff-page-shell";
import { StaffRoleForm } from "@/components/staff-role-form";
export default async function Page() {
  const p = await requireProfile("admin_staff");
  return (
    <StaffPageShell name={p.full_name}>
      <StaffRoleForm />
    </StaffPageShell>
  );
}
