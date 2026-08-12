import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { MessageCenter } from "@/components/message-center";

export default async function MessagesPage() {
  const profile = await requireProfile("admin_staff"),
    db = createAdminClient();
  const [{ data: users }, { data: favorites }] = await Promise.all([
    db
      .from("profiles")
      .select("id,full_name,email,avatar_url,role,phone,status,last_login_at")
      .neq("id", profile.id)
      .order("full_name"),
    db
      .from("message_favorites")
      .select("favorite_user_id")
      .eq("user_id", profile.id),
  ]);
  return (
    <StaffPageShell name={profile.full_name}>
      <MessageCenter
        currentUser={{
          id: profile.id,
          name: profile.full_name,
          avatar: profile.avatar_url,
        }}
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
    </StaffPageShell>
  );
}
