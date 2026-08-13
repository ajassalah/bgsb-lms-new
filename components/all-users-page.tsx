import { createAdminClient } from "@/lib/supabase/admin";
import { AllUsersManagement, type SystemUser } from "./all-users-management";
export async function AllUsersPage() {
  const db = createAdminClient(),
    [{ data: profiles }, { data: history }] = await Promise.all([
      db
        .from("profiles")
        .select(
          "id,full_name,email,avatar_url,role,status,created_at,last_login_at,verified_by,verifier:profiles!profiles_verified_by_fkey(full_name)",
        )
        .in("role", ["student", "instructor", "admin_staff"])
        .order("created_at", { ascending: false }),
      db
        .from("student_login_history")
        .select("student_id,ip_address,logged_at")
        .order("logged_at", { ascending: false }),
    ]);
  const ips = new Map<string, string>();
  (history || []).forEach((x: any) => {
    if (!ips.has(x.student_id)) ips.set(x.student_id, x.ip_address);
  });
  const rows: SystemUser[] = (profiles || []).map((x: any) => ({
    id: x.id,
    full_name: x.full_name,
    email: x.email,
    avatar_url: x.avatar_url,
    role: x.role,
    status: x.status,
    created_at: x.created_at,
    last_login_at: x.last_login_at,
    ip_address: ips.get(x.id) || null,
    created_by_name: null,
    verified_by_name: x.verifier?.full_name || null,
  }));
  return <AllUsersManagement initialRows={rows} />;
}
