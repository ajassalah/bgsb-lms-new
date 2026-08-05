import nodemailer from "nodemailer";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
export async function POST(req: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { data: p } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (p?.role !== "super_admin")
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .object({ student_id: z.string().uuid(), template_id: z.string().uuid() })
    .safeParse(await req.json());
  if (!parsed.success)
    return Response.json(
      { error: "Select an email template" },
      { status: 400 },
    );
  const admin = createAdminClient(),
    [{ data: student }, { data: template }, { data: config }] =
      await Promise.all([
        admin
          .from("profiles")
          .select("full_name,email")
          .eq("id", parsed.data.student_id)
          .single(),
        admin
          .from("email_templates")
          .select("*")
          .eq("id", parsed.data.template_id)
          .single(),
        admin.from("email_configuration").select("*").eq("id", 1).single(),
      ]);
  if (!student || !template || !config)
    return Response.json(
      { error: "Student, template or email configuration is missing" },
      { status: 400 },
    );
  try {
    const transport = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.encryption === "ssl",
      auth: config.smtp_username
        ? { user: config.smtp_username, pass: config.smtp_password }
        : undefined,
      requireTLS: config.encryption === "tls",
    });
    await transport.sendMail({
      from: `${config.from_name} <${config.from_email}>`,
      to: student.email,
      subject: template.subject,
      html: template.body,
      attachments: template.attachment_url
        ? [
            {
              filename: template.attachment_name || "attachment",
              path: template.attachment_url,
            },
          ]
        : [],
    });
    await admin
      .from("admin_activity_logs")
      .insert({
        actor_id: user.id,
        action: "send_email",
        entity_type: "student",
        entity_id: parsed.data.student_id,
        description: `Sent “${template.subject}” to ${student.email}`,
      });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Email delivery failed",
      },
      { status: 400 },
    );
  }
}
