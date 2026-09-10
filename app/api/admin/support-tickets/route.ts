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

export async function POST(req: Request) {
  const user = await authorize();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData(),
    roleId = String(form.get("role_id") || ""),
    parsed = z
      .object({
        student_id: z.string().uuid().optional(),
        subject: z.string().trim().min(2),
        priority: z.enum(["low", "medium", "high"]),
        status: z.enum(["open", "pending", "answered", "on_hold", "closed"]),
        description: z.string().trim().min(2),
      })
      .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message || "Invalid ticket details" },
      { status: 400 },
    );
  const admin = createAdminClient();
  if (!parsed.data.student_id && !roleId)
    return Response.json(
      { error: "Select a student or support role" },
      { status: 400 },
    );
  if (parsed.data.student_id) {
    const { data: student } = await admin
      .from("profiles")
      .select("id")
      .eq("id", parsed.data.student_id)
      .eq("role", "student")
      .single();
    if (!student)
      return Response.json(
        { error: "Select a valid student" },
        { status: 400 },
      );
  }
  const parsedRole = roleId ? z.string().uuid().safeParse(roleId) : null;
  if (roleId && !parsedRole?.success)
    return Response.json({ error: "Select a valid role" }, { status: 400 });
  let staffIds: string[] = [];
  if (roleId) {
    const { data: assistants } = await admin
      .from("support_assistants")
      .select("user_id")
      .eq("role_id", roleId);
    staffIds = Array.from(
      new Set((assistants || []).map((assistant) => assistant.user_id)),
    );
    if (!staffIds.length)
      return Response.json(
        { error: "No support assistants are assigned to this role" },
        { status: 400 },
      );
  }
  let attachment_url: string | null = null;
  const file = form.get("attachment");
  if (file instanceof File && file.size) {
    const safeName = file.name.replace(/[^a-z0-9.-]/gi, "-"),
      path = `support-tickets/${parsed.data.student_id || user.id}/${Date.now()}-${safeName}`,
      { error: uploadError } = await admin.storage
        .from("course-media")
        .upload(path, file, {
          contentType: file.type || "application/octet-stream",
        });
    if (uploadError)
      return Response.json({ error: uploadError.message }, { status: 400 });
    attachment_url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl;
  }
  const { data, error } = await admin
    .from("support_tickets")
    .insert({
      subject: parsed.data.subject,
      priority: parsed.data.priority,
      status: parsed.data.status,
      description: parsed.data.description,
      student_id: parsed.data.student_id || null,
      attachment_url,
      created_by: user.id,
    })
    .select("id,ticket_no")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  if (roleId) {
    const { data: recipients } = await admin
      .from("profiles")
      .select("id,role")
      .in("id", staffIds);
    await Promise.all([
      admin
        .from("support_ticket_staff")
        .insert(staffIds.map((staff_id) => ({ ticket_id: data.id, staff_id }))),
      admin.from("user_notifications").insert(
        (recipients || []).map((recipient) => ({
          user_id: recipient.id,
          title: `New ticket: ${parsed.data.subject}`,
          url:
            recipient.role === "super_admin"
              ? "/dashboard/super-admin/support/tickets"
              : "/dashboard/admin-staff/support/tickets",
        })),
      ),
    ]);
  }
  return Response.json(data);
}
