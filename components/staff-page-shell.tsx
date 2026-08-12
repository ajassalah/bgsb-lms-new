import { createAdminClient } from "@/lib/supabase/admin";
import { requireProfile } from "@/lib/auth";
import { StaffPortalShell } from "./staff-portal-shell";

export async function StaffPageShell({
  children,
}: {
  name?: string;
  children: React.ReactNode;
}) {
  const profile = await requireProfile("admin_staff");
  const admin = createAdminClient();
  const [{ data: staff }, { data: permissionRows }] = await Promise.all([
    admin.from("profiles").select("staff_role").eq("id", profile.id).single(),
    admin
      .from("admin_permissions")
      .select("module,actions")
      .eq("admin_staff_id", profile.id),
  ]);
  const permissions = Object.fromEntries(
    (permissionRows || []).map((row) => [row.module, row.actions || {}]),
  );
  return (
    <StaffPortalShell
      name={profile.full_name}
      roleName={staff?.staff_role || "Staff"}
      permissions={permissions}
    >
      {children}
    </StaffPortalShell>
  );
}
