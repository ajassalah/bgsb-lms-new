import { TicketView } from "@/components/ticket-view";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function Page({ params }: { params: { id: string } }) {
  const p = await requireProfile("instructor"),
    admin = createAdminClient(),
    { data } = await admin
      .from("support_tickets")
      .select(
        "id,ticket_no,subject,priority,status,description,attachment_url,created_at",
      )
      .eq("id", params.id)
      .eq("created_by", p.id)
      .single();
  if (!data) notFound();
  const { data: links } = await admin
    .from("support_ticket_staff")
    .select("staff_id")
    .eq("ticket_id", data.id);
  const staffIds = (links || []).map((link) => link.staff_id);
  const { data: assistant } = staffIds.length
    ? await admin
        .from("support_assistants")
        .select("role:support_assistant_roles(name)")
        .in("user_id", staffIds)
        .limit(1)
        .maybeSingle()
    : { data: null };
  const { data: replies } = await admin
    .from("support_ticket_replies")
    .select("id,message,attachment_url,created_at")
    .eq("ticket_id", data.id)
    .order("created_at", { ascending: false });
  const roleName =
    ((assistant?.role as { name?: string } | null)?.name as string) || "";
  return (
    <DashboardShell role="instructor" name={p.full_name}>
      <TicketView
        ticket={data as any}
        fallbackNo={params.id}
        roleName={roleName}
        replies={
          data.status === "answered" || data.status === "closed"
            ? (replies as any) || []
            : undefined
        }
        backHref="/dashboard/instructor/support/tickets"
      />
    </DashboardShell>
  );
}
