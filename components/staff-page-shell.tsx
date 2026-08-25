import { createAdminClient } from "@/lib/supabase/admin";
import { requireProfile } from "@/lib/auth";
import { StaffPortalShell } from "./staff-portal-shell";
import { getStaffPermissions } from "@/lib/staff-permissions";

export async function StaffPageShell({
  children,
}: {
  name?: string;
  children: React.ReactNode;
}) {
  const profile = await requireProfile("admin_staff");
  const admin = createAdminClient();
  const [{ data: staff }, permissions] = await Promise.all([
    admin.from("profiles").select("staff_role").eq("id", profile.id).single(),
    getStaffPermissions(profile.id),
  ]);
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
