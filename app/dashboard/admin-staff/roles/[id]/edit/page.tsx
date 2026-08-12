import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { StaffRoleForm } from "@/components/staff-role-form";
export default async function Page({ params }: { params: { id: string } }) {
  const p = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("staff_roles")
      .select("id,name,permissions")
      .eq("id", params.id)
      .single();
  if (!data) notFound();
  return (
    <StaffPageShell name={p.full_name}>
      <StaffRoleForm value={{ ...data, permissions: data.permissions || {} }} />
    </StaffPageShell>
  );
}
