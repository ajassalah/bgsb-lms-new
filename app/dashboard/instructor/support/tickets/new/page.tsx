import { DashboardShell } from "@/components/dashboard-shell";
import { InstructorTicketForm } from "@/components/instructor-ticket-form";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function Page() {
  const p = await requireProfile("instructor"),
    { data } = await createAdminClient()
      .from("support_assistant_roles")
      .select("id,name")
      .order("name");
  return (
    <DashboardShell role="instructor" name={p.full_name}>
      <InstructorTicketForm roles={data || []} />
    </DashboardShell>
  );
}
