import { AnnouncementView } from "@/components/announcement-view";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function StudentAnnouncementView({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("student");
  const now = new Date().toISOString();
  const { data } = await createAdminClient()
    .from("announcements")
    .select("title,body,created_at,scheduled_at,attachment_url")
    .eq("id", params.id)
    .contains("receiver_types", ["student"])
    .or(`scheduled_at.is.null,scheduled_at.lte.${now}`)
    .maybeSingle();
  if (!data) notFound();
  return (
    <DashboardShell
      role="student"
      name={profile.full_name}
      email={profile.email}
      avatar={profile.avatar_url}
    >
      <AnnouncementView data={data as any} backHref="/dashboard/student/announcements" />
    </DashboardShell>
  );
}
