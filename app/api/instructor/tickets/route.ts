import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
export async function POST(request: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!["instructor", "student"].includes(profile?.role || ""))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await request.formData(),
    parsed = z
      .object({
        role_id: z.string().uuid(),
        subject: z.string().trim().min(2),
        priority: z.enum(["low", "medium", "high"]),
        description: z.string().trim().min(2),
      })
      .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return Response.json(
      { error: "Select role and enter valid ticket details" },
      { status: 400 },
    );
  const admin = createAdminClient(),
    { data: assistants } = await admin
      .from("support_assistants")
      .select("user_id")
      .eq("role_id", parsed.data.role_id);
  const staffIds = Array.from(
    new Set((assistants || []).map((assistant) => assistant.user_id)),
  );
  if (!staffIds.length)
    return Response.json(
      { error: "No support assistants are assigned to this role" },
      { status: 400 },
    );
  let attachment_url: null | string = null;
  const file = form.get("attachment");
  if (file instanceof File && file.size) {
    const path = `support-tickets/instructor-${user.id}/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "-")}`,
      upload = await admin.storage.from("course-media").upload(path, file, {
        contentType: file.type || "application/octet-stream",
      });
    if (upload.error)
      return Response.json({ error: upload.error.message }, { status: 400 });
    attachment_url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl;
  }
  const { data: ticket, error } = await admin
    .from("support_tickets")
    .insert({
      subject: parsed.data.subject,
      priority: parsed.data.priority,
      status: "pending",
      description: parsed.data.description,
      attachment_url,
      created_by: user.id,
      student_id: null,
    })
    .select("id,ticket_no,subject,priority,status,created_at")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const { data: recipients } = await admin
    .from("profiles")
    .select("id,role")
    .in("id", staffIds);
  await Promise.all([
    admin
      .from("support_ticket_staff")
      .insert(staffIds.map((staff_id) => ({ ticket_id: ticket.id, staff_id }))),
    admin.from("user_notifications").insert(
      (recipients || []).map((recipient) => ({
        user_id: recipient.id,
        title: `New ticket: ${ticket.subject}`,
        url:
          recipient.role === "super_admin"
            ? "/dashboard/super-admin/support/tickets"
            : "/dashboard/admin-staff/support/tickets",
      })),
    ),
  ]);
  return Response.json(ticket);
}
