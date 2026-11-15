import { AnnouncementView } from "@/components/announcement-view";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
export default async function Page({ params }: { params: { id: string } }) {
  const p = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("announcements")
      .select("title,body,receiver_types,attachment_url,created_at")
      .eq("id", params.id)
      .single();
  if (!data) notFound();
  return (
    <SuperAdminShell name={p.full_name}>
      <AnnouncementView data={data as any} backHref="/dashboard/super-admin/announcements" />
    </SuperAdminShell>
  );
}
