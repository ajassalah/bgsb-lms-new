import { DashboardShell } from "@/components/dashboard-shell";
import { MessageCenter } from "@/components/message-center";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function Page() {
  const p = await requireProfile("instructor"),
    db = createAdminClient(),
    [{ data: users }, { data: favorites }] = await Promise.all([
      db
        .from("profiles")
        .select("id,full_name,email,avatar_url,role,phone,status,last_login_at")
        .neq("id", p.id)
        .order("full_name"),
      db
        .from("message_favorites")
        .select("favorite_user_id")
        .eq("user_id", p.id),
    ]);
  return (
    <DashboardShell role="instructor" name={p.full_name}>
      <MessageCenter
        currentUser={{ id: p.id, name: p.full_name, avatar: p.avatar_url }}
        users={(users || []).map((x) => ({
          id: x.id,
          name: x.full_name,
          email: x.email,
          avatar: x.avatar_url,
          role: x.role,
          phone: x.phone,
          status: x.status,
          lastLogin: x.last_login_at,
        }))}
        initialFavorites={(favorites || []).map((x) => x.favorite_user_id)}
      />
    </DashboardShell>
  );
}
