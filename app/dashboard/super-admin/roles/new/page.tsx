import { requireProfile } from "@/lib/auth";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { StaffRoleForm } from "@/components/staff-role-form";
export default async function Page() {
  const p = await requireProfile("super_admin");
  return (
    <SuperAdminShell name={p.full_name}>
      <StaffRoleForm />
    </SuperAdminShell>
  );
}
