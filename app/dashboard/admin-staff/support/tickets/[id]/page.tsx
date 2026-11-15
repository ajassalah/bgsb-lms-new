import Link from "next/link";
import { TicketView } from "@/components/ticket-view";
import { notFound } from "next/navigation";
import { StaffPageShell } from "@/components/staff-page-shell";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function TicketViewPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("admin_staff");
  const admin = createAdminClient();
  const { data: ticket } = await admin
    .from("support_tickets")
    .select(
      "id,ticket_no,subject,priority,status,description,attachment_url,created_at,created_by,student_id",
    )
    .eq("id", params.id)
    .single();

  if (!ticket) notFound();
  const [{ data: links }, { data: creator }, { data: student }] =
    await Promise.all([
      admin
        .from("support_ticket_staff")
        .select("staff_id")
        .eq("ticket_id", ticket.id),
      ticket.created_by
        ? admin
            .from("profiles")
            .select("full_name,email")
            .eq("id", ticket.created_by)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      ticket.student_id
        ? admin
            .from("profiles")
            .select("full_name,email")
            .eq("id", ticket.student_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
  const staffIds = (links || []).map((link) => link.staff_id);
  const { data: assistant } = staffIds.length
    ? await admin
        .from("support_assistants")
        .select("role:support_assistant_roles(name)")
        .in("user_id", staffIds)
        .limit(1)
        .maybeSingle()
    : { data: null };

  return (
    <StaffPageShell name={profile.full_name}>
      <TicketView
        ticket={ticket as any}
        fallbackNo={params.id}
        roleName={
          ((assistant?.role as { name?: string } | null)?.name as string) || ""
        }
        createdBy={creator?.full_name || student?.full_name || "Unknown"}
        backHref="/dashboard/admin-staff/support/tickets"
        actions={
          <Link href={`/dashboard/admin-staff/support/tickets/${params.id}/reply`} className="btn-primary">
            Reply
          </Link>
        }
      />
    </StaffPageShell>
  );
}

