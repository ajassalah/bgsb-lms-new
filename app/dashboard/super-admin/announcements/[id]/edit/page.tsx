import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { AnnouncementForm } from "@/components/announcement-form";
export default async function Page({ params }: { params: { id: string } }) {
  const p = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("announcements")
      .select("id,title,body,receiver_types,attachment_url,scheduled_at")
      .eq("id", params.id)
      .single();
  if (!data) notFound();
  return (
    <SuperAdminShell name={p.full_name}>
      <AnnouncementForm
        value={{
          ...data,
          body: data.body || "",
          receiver_types: data.receiver_types || [],
        }}
      />
    </SuperAdminShell>
  );
}
