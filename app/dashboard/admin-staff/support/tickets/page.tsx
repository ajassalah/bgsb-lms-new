import { StaffPageShell } from "@/components/staff-page-shell";
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
    [{ data }, { data: assistantRole }] = await Promise.all([
      ids.length
        ? db
            .from("support_tickets")
            .select(
              "id,ticket_no,subject,priority,status,created_at,creator:profiles!support_tickets_created_by_fkey(full_name,email)",
            )
            .in("id", ids)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] }),
      db
        .from("support_assistants")
        .select("role:support_assistant_roles(name)")
        .eq("user_id", p.id)
        .maybeSingle(),
    ]);
  const roleName =
    ((assistantRole?.role as { name?: string } | null)?.name as string) || "";
  const rows: TicketRow[] = (data || []).map((x: any) => ({
    id: x.id,
    ticketNo: x.ticket_no || x.id.slice(0, 8).toUpperCase(),
    roleName,
    name: x.creator?.full_name || "Instructor",
    email: x.creator?.email || "",
    subject: x.subject,
    priority: x.priority,
    created: x.created_at,
    status: x.status,
  }));
  return (
    <StaffPageShell name={p.full_name}>
      <SupportTicketManagement initialRows={rows} />
    </StaffPageShell>
  );
}
