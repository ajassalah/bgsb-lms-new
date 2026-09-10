import { DashboardShell } from "@/components/dashboard-shell";
import { InstructorTicketForm } from "@/components/instructor-ticket-form";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function NewStudentTicket() {
  const p = await requireProfile("student");
  const { data } = await createAdminClient()
    .from("support_assistant_roles")
    .select("id,name")
    .order("name");
  return (
    <DashboardShell
      role="student"
      name={p.full_name}
      email={p.email}
      avatar={p.avatar_url}
    >
      <InstructorTicketForm
        basePath="/dashboard/student/support/tickets"
        roles={data || []}
      />
    </DashboardShell>
  );
}
