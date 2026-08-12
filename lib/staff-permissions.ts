import { createAdminClient } from "@/lib/supabase/admin";

export async function staffCan(userId: string, module: string, action: string) {
  const { data: profile } = await createAdminClient()
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.role === "super_admin") return true;
  if (profile?.role !== "admin_staff") return false;
  const { data } = await createAdminClient()
    .from("admin_permissions")
    .select("actions")
    .eq("admin_staff_id", userId)
    .eq("module", module)
    .maybeSingle();
  return !!(data?.actions as Record<string, boolean> | null)?.[action];
}

export async function adminActorCan(
  userId: string,
  module: string,
  action: string,
) {
  return staffCan(userId, module, action);
}
