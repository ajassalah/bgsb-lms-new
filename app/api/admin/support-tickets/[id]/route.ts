import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function authorize() {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return null;
  const { data } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return ["super_admin", "admin_staff"].includes(data?.role || "")
    ? user
    : null;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await authorize();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const admin = createAdminClient();
  const { data: ticket, error } = await admin
    .from("support_tickets")
    .select(
      "id,ticket_no,subject,priority,status,description,attachment_url,created_at,created_by,student_id",
    )
    .eq("id", params.id)
    .single();
  if (error || !ticket)
    return Response.json({ error: "Ticket not found" }, { status: 404 });
  const [
    { data: links },
    { data: creator },
    { data: student },
    { data: replies },
  ] = await Promise.all([
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
    admin
      .from("support_ticket_replies")
      .select("id,message,attachment_url,created_at,replied_by")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: false }),
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
  const replierIds = Array.from(
    new Set((replies || []).map((reply) => reply.replied_by).filter(Boolean)),
  );
  const { data: repliers } = replierIds.length
    ? await admin
        .from("profiles")
        .select("id,full_name,email")
        .in("id", replierIds)
    : { data: [] };
  const replierById = new Map((repliers || []).map((row) => [row.id, row]));
  return Response.json({
    ...ticket,
    role_name:
      ((assistant?.role as { name?: string } | null)?.name as string) || "",
    creator,
    student,
    replies: (replies || []).map((reply) => ({
      ...reply,
      replier: replierById.get(reply.replied_by) || null,
    })),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await authorize();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json(),
    parsed = z
      .union([
        z.object({
          status: z.enum(["open", "pending", "answered", "on_hold", "closed"]),
        }),
        z.object({ reply: z.string().trim().min(2) }),
      ])
      .safeParse(body);
  if (!parsed.success)
    return Response.json({ error: "Invalid ticket update" }, { status: 400 });
  const admin = createAdminClient();
  if ("reply" in parsed.data) {
    const { error } = await admin.from("support_ticket_replies").insert({
      ticket_id: params.id,
      message: parsed.data.reply,
      replied_by: user.id,
    });
    if (!error)
      await admin
        .from("support_tickets")
        .update({
          status: "answered",
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id);
    return error
      ? Response.json({ error: error.message }, { status: 400 })
      : Response.json({ status: "answered" });
  }
  const { error } = await admin
    .from("support_tickets")
    .update({
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id);
  if (
    !error &&
    (parsed.data.status === "answered" || parsed.data.status === "closed")
  )
    await notifyTicketCreator(admin, params.id, parsed.data.status);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ status: parsed.data.status });
}

async function notifyTicketCreator(
  admin: ReturnType<typeof createAdminClient>,
  ticketId: string,
  status: "answered" | "closed",
) {
  const { data: ticket } = await admin
    .from("support_tickets")
    .select("id,subject,created_by,student_id")
    .eq("id", ticketId)
    .maybeSingle();
  const ids = Array.from(
    new Set(
      [ticket?.created_by, ticket?.student_id].filter(Boolean) as string[],
    ),
  );
  if (!ticket || !ids.length) return;
  const { data: recipients } = await admin
    .from("profiles")
    .select("id,role")
    .in("id", ids);
  const label = status === "closed" ? "closed" : "answered";
  await admin.from("user_notifications").insert(
    (recipients || []).map((recipient) => ({
      user_id: recipient.id,
      title: `Ticket ${label}: ${ticket.subject}`,
      url:
        recipient.role === "student"
          ? `/dashboard/student/support/tickets/${ticket.id}`
          : recipient.role === "instructor"
            ? `/dashboard/instructor/support/tickets/${ticket.id}`
            : recipient.role === "super_admin"
              ? "/dashboard/super-admin/support/tickets"
              : "/dashboard/admin-staff/support/tickets",
    })),
  );
}
