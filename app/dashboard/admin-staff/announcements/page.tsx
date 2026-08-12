import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { AnnouncementManagement } from "@/components/announcement-management";
export default async function Page() {
  const profile = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("announcements")
      .select("id,title,body,receiver_types")
      .order("created_at", { ascending: false });
  return (
    <StaffPageShell name={profile.full_name}>
      <AnnouncementManagement
        initialRows={(data || []).map((x) => ({
          id: x.id,
          title: x.title,
          body: x.body || "",
          receivers: x.receiver_types || [],
        }))}
      />
    </StaffPageShell>
  );
}
