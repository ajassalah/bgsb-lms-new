import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import {
  RecentActivityManagement,
  type ActivityRow,
} from "@/components/recent-activity-management";
export default async function Page() {
  const p = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("admin_activity_logs")
      .select(
        "id,action,description,created_at,ip_address,actor:profiles!admin_activity_logs_actor_id_fkey(full_name,email,avatar_url)",
      )
      .order("created_at", { ascending: false })
      .limit(500);
  return (
    <StaffPageShell name={p.full_name}>
      <RecentActivityManagement
        rows={(data || []) as unknown as ActivityRow[]}
      />
    </StaffPageShell>
  );
}
