import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { AnnouncementForm } from "@/components/announcement-form";
export default async function Page({ params }: { params: { id: string } }) {
  const p = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("announcements")
      .select("id,title,body,receiver_types,attachment_url,scheduled_at")
      .eq("id", params.id)
      .single();
  if (!data) notFound();
  return (
    <StaffPageShell name={p.full_name}>
      <AnnouncementForm
        value={{
          ...data,
          body: data.body || "",
          receiver_types: data.receiver_types || [],
        }}
      />
    </StaffPageShell>
  );
}
