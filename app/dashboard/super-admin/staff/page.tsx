import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import {
  InstructorManagement,
  type InstructorRow,
} from "@/components/instructor-management";

export default async function StaffPage() {
  const profile = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("profiles")
      .select("id,full_name,email,phone,last_login_at,status,avatar_url")
      .eq("role", "admin_staff")
      .order("created_at", { ascending: false });
  return (
    <SuperAdminShell name={profile.full_name}>
      <InstructorManagement
        initialRows={(data || []) as InstructorRow[]}
        entity="Staff"
        basePath="/dashboard/super-admin/staff"
        profileRole="admin_staff"
      />
    </SuperAdminShell>
  );
}
