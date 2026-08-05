import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { AnnouncementManagement } from "@/components/announcement-management";
export default async function Page() {
  const profile = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("announcements")
      .select("id,title,body,receiver_types")
      .order("created_at", { ascending: false });
  return (
    <SuperAdminShell name={profile.full_name}>
      <AnnouncementManagement
        initialRows={(data || []).map((x) => ({
          id: x.id,
          title: x.title,
          body: x.body || "",
          receivers: x.receiver_types || [],
        }))}
      />
    </SuperAdminShell>
  );
}
