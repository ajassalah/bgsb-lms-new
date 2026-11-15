import { AnnouncementView } from "@/components/announcement-view";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function Page({ params }: { params: { id: string } }) {
  const p = await requireProfile("instructor"),
    { data } = await createAdminClient()
      .from("announcements")
      .select("title,body,created_at,attachment_url")
      .eq("id", params.id)
      .single();
  if (!data) notFound();
  return (
    <DashboardShell role="instructor" name={p.full_name}>
      <AnnouncementView data={data as any} backHref="/dashboard/instructor/announcements" />
    </DashboardShell>
  );
}
