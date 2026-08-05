import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import {
  SupportTicketManagement,
  type TicketRow,
} from "@/components/support-ticket-management";

export default async function TicketsPage() {
  const profile = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("support_tickets")
      .select(
        "id,subject,priority,status,created_at,student:profiles!support_tickets_student_id_fkey(full_name,email)",
      )
      .order("created_at", { ascending: false });
  const rows: TicketRow[] = (data || []).map((ticket: any) => ({
    id: ticket.id,
    name: ticket.student?.full_name || "Student",
    email: ticket.student?.email || "",
    subject: ticket.subject,
    priority: ticket.priority,
    created: ticket.created_at,
    status: ticket.status,
  }));
  return (
    <SuperAdminShell name={profile.full_name}>
      <SupportTicketManagement initialRows={rows} />
    </SuperAdminShell>
  );
}
