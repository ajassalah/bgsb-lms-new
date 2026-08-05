import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { SupportTicketForm } from "@/components/support-ticket-form";

export default async function NewTicketPage() {
  const profile = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("profiles")
      .select("id,full_name,email,avatar_url")
      .eq("role", "student")
      .eq("status", "active")
      .order("full_name");
  return (
    <SuperAdminShell name={profile.full_name}>
      <SupportTicketForm
        students={(data || []).map((student) => ({
          id: student.id,
          name: student.full_name,
          email: student.email,
          avatar: student.avatar_url,
        }))}
      />
    </SuperAdminShell>
  );
}
