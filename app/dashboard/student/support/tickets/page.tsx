import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ReadOnlyTable } from "@/components/instructor-portal-pages";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function StudentTickets() {
  const p = await requireProfile("student");
  const { data } = await createAdminClient()
    .from("support_tickets")
    .select("id,ticket_no,subject,priority,status,created_at")
    .eq("created_by", p.id)
    .order("created_at", { ascending: false });
  return (
    <DashboardShell
      role="student"
      name={p.full_name}
      email={p.email}
      avatar={p.avatar_url}
    >
      <div className="mb-[-52px] flex justify-end">
        <Link
          href="/dashboard/student/support/tickets/new"
          className="btn-primary relative z-10 gap-2"
        >
          <Plus className="size-4" />
          New
        </Link>
      </div>
      <ReadOnlyTable
        title="Tickets"
        columns={["Ticket No", "Subject", "Priority", "Created", "Status"]}
        rows={(data || []).map((ticket) => ({
          id: ticket.id,
          cells: [
            ticket.ticket_no || ticket.id.slice(0, 8).toUpperCase(),
            ticket.subject,
            ticket.priority,
            new Date(ticket.created_at).toLocaleString("en-GB"),
            ticket.status,
          ],
          view: `/dashboard/student/support/tickets/${ticket.id}`,
        }))}
      />
    </DashboardShell>
  );
}
