import { notFound } from "next/navigation";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function TicketViewPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("super_admin");
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
    <SuperAdminShell name={profile.full_name}>
      <TicketDetails
        ticket={{ ...ticket, creator, student } as any}
        roleName={
          ((assistant?.role as { name?: string } | null)?.name as string) || ""
        }
        fallbackNo={params.id}
      />
    </SuperAdminShell>
  );
}

function TicketDetails({
  ticket,
  roleName,
  fallbackNo,
}: {
  ticket: any;
  roleName: string;
  fallbackNo: string;
}) {
  return (
    <>
      <p className="text-sm text-slate-400">Support / Tickets / View</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">{ticket.subject}</h1>
      <section className="mt-7 rounded-xl border bg-white p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Info
            label="Ticket No"
            value={ticket.ticket_no || fallbackNo.slice(0, 8).toUpperCase()}
          />
          <Info label="Priority" value={ticket.priority} />
          <Info label="Status" value={ticket.status?.replace("_", " ")} />
          <Info
            label="Created"
            value={new Date(ticket.created_at).toLocaleString("en-GB")}
          />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Info label="Role" value={roleName || "Not assigned"} />
          <Info
            label="Created By"
            value={
              ticket.creator?.full_name ||
              ticket.student?.full_name ||
              "Unknown"
            }
          />
        </div>
        <div
          className="prose mt-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: ticket.description }}
        />
        {ticket.attachment_url && (
          <a
            href={ticket.attachment_url}
            target="_blank"
            className="btn-secondary mt-6"
          >
            View Attachment
          </a>
        )}
      </section>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-bold uppercase text-slate-400">
        {label}
      </span>
      <b className="mt-1 block capitalize text-navy">{value}</b>
    </div>
  );
}
