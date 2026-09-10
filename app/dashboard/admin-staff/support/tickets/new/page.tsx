import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { SupportTicketForm } from "@/components/support-ticket-form";

export default async function NewTicketPage() {
  const profile = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("support_assistant_roles")
      .select("id,name")
      .order("name");
  return (
    <StaffPageShell name={profile.full_name}>
      <SupportTicketForm roles={data || []} assignByRole />
    </StaffPageShell>
  );
}
