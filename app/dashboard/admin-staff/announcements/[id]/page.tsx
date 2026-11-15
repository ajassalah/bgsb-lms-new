import { AnnouncementView } from "@/components/announcement-view";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
export default async function Page({ params }: { params: { id: string } }) {
  const p = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("announcements")
      .select("title,body,receiver_types,attachment_url,created_at")
      .eq("id", params.id)
      .single();
  if (!data) notFound();
  return (
    <StaffPageShell name={p.full_name}>
      <AnnouncementView data={data as any} backHref="/dashboard/admin-staff/announcements" />
    </StaffPageShell>
  );
}
