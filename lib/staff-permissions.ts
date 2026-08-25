import { createAdminClient } from "@/lib/supabase/admin";

export type StaffPermissions = Record<string, Record<string, boolean>>;

export async function getStaffPermissions(
  userId: string,
): Promise<StaffPermissions> {
  const admin = createAdminClient();
  const [{ data: profile }, { data: rows }] = await Promise.all([
    admin
      .from("profiles")
      .select("role,staff_role")
      .eq("id", userId)
      .maybeSingle(),
    admin
      .from("admin_permissions")
      .select("module,actions")
      .eq("admin_staff_id", userId),
  ]);
  if (profile?.role !== "admin_staff") return {};
  const copied = Object.fromEntries(
    (rows || []).map((row) => [
      row.module,
      (row.actions || {}) as Record<string, boolean>,
    ]),
  );
  if (!profile.staff_role) return copied;
  const { data: assignedRole } = await admin
    .from("staff_roles")
    .select("permissions")
    .ilike("name", profile.staff_role.trim())
    .maybeSingle();
  return {
    ...copied,
    ...((assignedRole?.permissions || {}) as StaffPermissions),
  };
}

export async function staffCan(userId: string, module: string, action: string) {
  const { data: profile } = await createAdminClient()
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.role === "super_admin") return true;
  if (profile?.role !== "admin_staff") return false;
  const permissions = await getStaffPermissions(userId);
  return !!permissions[module]?.[action] || !!permissions[module]?.full_access;
}

export async function adminActorCan(
  userId: string,
  module: string,
  action: string,
) {
  return staffCan(userId, module, action);
}
