import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { StaffRoleManagement } from "@/components/staff-role-management";
export default async function Page() {
  const p = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("staff_roles")
      .select("id,name,permissions")
      .order("created_at", { ascending: false });
  return (
    <StaffPageShell name={p.full_name}>
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
    </StaffPageShell>
  );
}
