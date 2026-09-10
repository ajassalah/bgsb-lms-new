import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SuperAdminShell } from "@/components/super-admin-shell";
import {
  SupportTicketManagement,
  type TicketRow,
} from "@/components/support-ticket-management";

export default async function TicketsPage() {
  const profile = await requireProfile("super_admin"),
    admin = createAdminClient(),
    { data } = await admin
      .from("support_tickets")
      .select(
        "id,ticket_no,subject,priority,status,created_at,student:profiles!support_tickets_student_id_fkey(full_name,email)",
      )
      .order("created_at", { ascending: false });
  const ticketIds = (data || []).map((ticket) => ticket.id);
  const { data: staffLinks } = ticketIds.length
    ? await admin
        .from("support_ticket_staff")
        .select("ticket_id,staff_id")
        .in("ticket_id", ticketIds)
    : { data: [] };
  const staffIds = Array.from(
    new Set((staffLinks || []).map((link) => link.staff_id)),
  );
  const { data: assistants } = staffIds.length
    ? await admin
        .from("support_assistants")
        .select("user_id,role:support_assistant_roles(name)")
        .in("user_id", staffIds)
    : { data: [] };
  const roleByStaff = new Map(
    (assistants || []).map((assistant: any) => [
      assistant.user_id,
      assistant.role?.name || "",
    ]),
  );
  const roleByTicket = new Map<string, string>();
  for (const link of staffLinks || []) {
    if (!roleByTicket.has(link.ticket_id))
      roleByTicket.set(link.ticket_id, roleByStaff.get(link.staff_id) || "");
  }
  const rows: TicketRow[] = (data || []).map((ticket: any) => ({
    id: ticket.id,
    ticketNo: ticket.ticket_no || ticket.id.slice(0, 8).toUpperCase(),
    roleName: roleByTicket.get(ticket.id) || "",
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
