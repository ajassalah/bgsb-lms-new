import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { StaffRoleManagement } from "@/components/staff-role-management";
export default async function Page() {
  const p = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("staff_roles")
      .select("id,name,permissions")
      .order("created_at", { ascending: false });
  return (
    <SuperAdminShell name={p.full_name}>
      <StaffRoleManagement
        initialRows={(data || []).map((x) => ({
          id: x.id,
          name: x.name,
          permissions: x.permissions || {},
          count: Object.values(x.permissions || {}).reduce(
            (n: any, v: any) => n + Object.values(v).filter(Boolean).length,
            0,
          ) as number,
        }))}
      />
    </SuperAdminShell>
  );
}
