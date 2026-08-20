import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SuperAdminShell } from "@/components/super-admin-shell";
import {
  RecentActivityManagement,
  type ActivityRow,
} from "@/components/recent-activity-management";
export default async function Page() {
  const p = await requireProfile("super_admin"),
    { data } = await createAdminClient()
      .from("admin_activity_logs")
      .select(
        "id,action,entity_type,description,metadata,created_at,ip_address,actor:profiles!admin_activity_logs_actor_id_fkey(full_name,email,avatar_url)",
      )
      .order("created_at", { ascending: false })
      .limit(500);
  return (
    <SuperAdminShell name={p.full_name}>
      <RecentActivityManagement
        rows={(data || []) as unknown as ActivityRow[]}
      />
    </SuperAdminShell>
  );
}
