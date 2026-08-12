import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { SupportTicketForm } from "@/components/support-ticket-form";

export default async function NewTicketPage() {
  const profile = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("profiles")
      .select("id,full_name,email,avatar_url")
      .eq("role", "student")
      .eq("status", "active")
      .order("full_name");
  return (
    <StaffPageShell name={profile.full_name}>
      <SupportTicketForm
        students={(data || []).map((student) => ({
          id: student.id,
          name: student.full_name,
          email: student.email,
          avatar: student.avatar_url,
        }))}
      />
    </StaffPageShell>
  );
}
