import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailTransport, getEmailConfiguration } from "@/lib/email";
import { staffCan } from "@/lib/staff-permissions";
import { z } from "zod";

const payloadSchema = z.object({
  studentIds: z.array(z.string().uuid()).min(1).max(500),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(10000),
});
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]!);

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const db = createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user || !(await staffCan(user.id, "batches", "send_email"))) return Response.json({ error: "Forbidden" }, { status: 403 });
  const payload = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) return Response.json({ error: "Add recipients, a subject and a message" }, { status: 400 });
  const admin = createAdminClient();
  const [{ data: batch }, { data: memberships }, config] = await Promise.all([
    admin.from("batches").select("batch_name").eq("id", params.id).maybeSingle(),
    admin.from("batch_learners").select("student_id").eq("batch_id", params.id).in("student_id", payload.data.studentIds),
    getEmailConfiguration(),
  ]);
  if (!batch) return Response.json({ error: "Batch not found" }, { status: 404 });
  if (!config?.smtp_host || !config.from_email) return Response.json({ error: "SMTP email configuration is incomplete" }, { status: 400 });
  const memberIds = (memberships || []).map((item) => item.student_id);
  if (!memberIds.length) return Response.json({ error: "Select learners from this batch" }, { status: 400 });
  const { data: recipients } = await admin.from("profiles").select("id,email,full_name").in("id", memberIds).eq("role", "student");
  const transport = emailTransport(config);
  try {
    await Promise.all((recipients || []).filter((recipient) => recipient.email).map((recipient) => transport.sendMail({ from: `${config.from_name} <${config.from_email}>`, to: recipient.email, subject: payload.data.subject, text: `Hi ${recipient.full_name},\n\n${payload.data.message}\n\n${batch.batch_name}`, html: `<p>Hi ${escapeHtml(recipient.full_name)},</p><p style="white-space:pre-line">${escapeHtml(payload.data.message)}</p><p>${escapeHtml(batch.batch_name)}</p>` })));
    await admin.from("admin_activity_logs").insert({ actor_id: user.id, action: "send_email", entity_type: "batch", entity_id: params.id, description: `Sent “${payload.data.subject}” to ${recipients?.length || 0} batch learners` });
    return Response.json({ sent: recipients?.length || 0 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Email delivery failed" }, { status: 400 });
  }
}
