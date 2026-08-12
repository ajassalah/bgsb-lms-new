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
    staffIds = form.getAll("staff_ids").map(String),
    parsed = z
      .object({
        subject: z.string().trim().min(2),
        priority: z.enum(["low", "medium", "high"]),
        description: z.string().trim().min(2),
      })
      .safeParse(Object.fromEntries(form));
  if (!parsed.success || !staffIds.length)
    return Response.json(
      { error: "Select staff and enter valid ticket details" },
      { status: 400 },
    );
  const admin = createAdminClient(),
    { data: staff } = await admin
      .from("profiles")
      .select("id")
      .in("id", staffIds)
      .eq("role", "admin_staff")
      .eq("status", "active");
  if ((staff || []).length !== new Set(staffIds).size)
    return Response.json(
      { error: "Select valid staff users" },
      { status: 400 },
    );
  let attachment_url: null | string = null;
  const file = form.get("attachment");
  if (file instanceof File && file.size) {
    const path = `support-tickets/instructor-${user.id}/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "-")}`,
      upload = await admin.storage
        .from("course-media")
        .upload(path, file, {
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
      ...parsed.data,
      status: "pending",
      description: parsed.data.description,
      attachment_url,
      created_by: user.id,
      student_id: null,
    })
    .select("id,subject,priority,status,created_at")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  await Promise.all([
    admin
      .from("support_ticket_staff")
      .insert(staffIds.map((staff_id) => ({ ticket_id: ticket.id, staff_id }))),
    admin
      .from("user_notifications")
      .insert(
        staffIds.map((user_id) => ({
          user_id,
          title: `New ticket: ${ticket.subject}`,
          url: "/dashboard/admin-staff/support/tickets",
        })),
      ),
  ]);
  return Response.json(ticket);
}
