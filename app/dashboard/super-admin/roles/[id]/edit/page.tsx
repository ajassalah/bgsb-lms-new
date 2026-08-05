import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { StaffRoleForm } from "@/components/staff-role-form";
export default async function Page({ params }: { params: { id: string } }) {
  const p = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("staff_roles")
      .select("id,name,permissions")
      .eq("id", params.id)
      .single();
  if (!data) notFound();
  return (
    <SuperAdminShell name={p.full_name}>
      <StaffRoleForm value={{ ...data, permissions: data.permissions || {} }} />
    </SuperAdminShell>
  );
}
