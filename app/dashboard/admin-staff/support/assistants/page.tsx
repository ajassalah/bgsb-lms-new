import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { SupportAssistantManagement } from "@/components/support-assistant-management";

export default async function SupportAssistantsPage() {
  const profile = await requireProfile("admin_staff");
  const admin = createAdminClient();
  const [{ data: roles }, { data: assistants }, { data: users }] =
    await Promise.all([
      admin
        .from("support_assistant_roles")
        .select("id,name,created_at")
        .order("name"),
      admin
        .from("support_assistants")
        .select(
          "id,user_id,role_id,designation,created_at,user:profiles!support_assistants_user_id_fkey(full_name,email,avatar_url,role,staff_role),role:support_assistant_roles(name)",
        )
        .order("created_at", { ascending: false }),
      admin
        .from("profiles")
        .select("id,full_name,email,avatar_url,role,staff_role")
        .in("role", ["super_admin", "admin_staff"])
        .eq("status", "active")
        .order("full_name"),
    ]);
  return (
    <StaffPageShell name={profile.full_name}>
      <SupportAssistantManagement
        initialRoles={roles || []}
        initialAssistants={(assistants || []) as any}
        users={(users || []) as any}
      />
    </StaffPageShell>
  );
}
