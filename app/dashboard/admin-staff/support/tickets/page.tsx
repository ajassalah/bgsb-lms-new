import { DashboardShell } from "@/components/dashboard-shell";
import {
  SupportTicketManagement,
  type TicketRow,
} from "@/components/support-ticket-management";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function Page() {
  const p = await requireProfile("admin_staff"),
    db = createAdminClient(),
    { data: links } = await db
      .from("support_ticket_staff")
      .select("ticket_id")
      .eq("staff_id", p.id),
    ids = (links || []).map((x) => x.ticket_id),
    { data } = ids.length
      ? await db
          .from("support_tickets")
          .select(
            "id,subject,priority,status,created_at,creator:profiles!support_tickets_created_by_fkey(full_name,email)",
          )
          .in("id", ids)
          .order("created_at", { ascending: false })
      : { data: [] };
  const rows: TicketRow[] = (data || []).map((x: any) => ({
    id: x.id,
    name: x.creator?.full_name || "Instructor",
    email: x.creator?.email || "",
    subject: x.subject,
    priority: x.priority,
    created: x.created_at,
    status: x.status,
  }));
  return (
    <DashboardShell role="admin_staff" name={p.full_name}>
      <SupportTicketManagement initialRows={rows} />
    </DashboardShell>
  );
}
