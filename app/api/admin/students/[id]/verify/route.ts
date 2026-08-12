import { randomBytes } from "crypto";
import nodemailer from "nodemailer";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { data: actor } = await db
    .from("profiles")
    .select("role,full_name,staff_role")
    .eq("id", user.id)
    .single();
  const staffRole = actor?.staff_role?.trim().toLowerCase();
  const canDecide =
    actor?.role === "super_admin" ||
    (actor?.role === "admin_staff" &&
      (staffRole === "admin" || staffRole === "manager"));
  if (!canDecide)
    return Response.json(
      { error: "Only an authorized administrator can verify students" },
      { status: 403 },
    );
  const parsed = z
    .object({ action: z.enum(["verify", "decline"]) })
    .safeParse(await request.json());
  if (!parsed.success)
    return Response.json(
      { error: "Select Verify or Decline" },
      { status: 400 },
    );
  const admin = createAdminClient(),
    [{ data: student }, { data: config }] = await Promise.all([
      admin
        .from("profiles")
        .select("full_name,email")
        .eq("id", params.id)
        .eq("role", "student")
        .single(),
      admin.from("email_configuration").select("*").eq("id", 1).single(),
    ]);
  if (!student)
    return Response.json({ error: "Student was not found" }, { status: 404 });
  const now = new Date().toISOString();
  if (parsed.data.action === "decline") {
    const { error } = await admin
      .from("profiles")
      .update({
        verification_status: "declined",
        verified_as: null,
        verified_by: user.id,
        verified_at: now,
        status: "suspended",
      })
      .eq("id", params.id);
    if (error) return Response.json({ error: error.message }, { status: 400 });
    await admin.auth.admin.updateUserById(params.id, {
      ban_duration: "876000h",
    });
    await admin.from("admin_activity_logs").insert({
      actor_id: user.id,
      action: "decline",
      entity_type: "student",
      entity_id: params.id,
      description: `Declined student verification for ${student.full_name}`,
    });
    return Response.json({ verification_status: "declined", verified_at: now });
  }
  if (!config)
    return Response.json(
      { error: "Configure SMTP email before verifying students" },
      { status: 400 },
    );
  const temporaryPassword = `Bgsb@${randomBytes(6).toString("base64url")}9`,
    loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin}/login`;
  const transport = nodemailer.createTransport({
    host: config.smtp_host,
    port: config.smtp_port,
    secure: config.encryption === "ssl",
    auth: config.smtp_username
      ? { user: config.smtp_username, pass: config.smtp_password }
      : undefined,
    requireTLS: config.encryption === "tls",
  });
  try {
    await transport.verify();
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? `SMTP connection failed: ${error.message}`
            : "SMTP connection failed. Check the host, port, encryption, username, and password.",
      },
      { status: 400 },
    );
  }
  const authUpdate = await admin.auth.admin.updateUserById(params.id, {
    password: temporaryPassword,
    email_confirm: true,
    ban_duration: "none",
    user_metadata: { full_name: student.full_name, must_change_password: true },
  });
  if (authUpdate.error)
    return Response.json({ error: authUpdate.error.message }, { status: 400 });
  try {
    const studentName = student.full_name.replace(
      /[&<>"']/g,
      (character: string) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        } as Record<string, string>)[character]!,
    );
    await transport.sendMail({
      from: `${config.from_name} <${config.from_email}>`,
      to: student.email,
      subject:
        "🎓 Welcome to British Graduate School of Business LMS – Your Student Account Is Ready",
      html: `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#172033;line-height:1.65"><h2>Welcome to the British Graduate School of Business LMS, ${studentName}! 🎓</h2><p>Dear <strong>${studentName}</strong>,</p><p>We are delighted to welcome you to the <strong>British Graduate School of Business (BGSB)</strong>.</p><p>Your student account has been successfully created and verified. You can now access our <strong>Learning Management System (LMS)</strong> to view your courses, learning materials, assignments, announcements, and other academic resources.</p><h3>🔐 Your LMS Login Details</h3><div style="padding:16px;background:#f4f7fb;border-radius:10px"><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a><br><strong>Username:</strong> ${student.email}<br><strong>Temporary Password:</strong> ${temporaryPassword}</div><p>For your security, please sign in and change your temporary password immediately after your first login.</p><h3>📚 What You Can Access Through the LMS</h3><ul><li>Access your enrolled courses</li><li>View course materials and learning resources</li><li>Submit assignments</li><li>Track your learning progress</li><li>View important announcements</li><li>Access your class information</li><li>Communicate with your instructors and academic team</li><li>Keep up to date with your academic activities</li></ul><h3>🚀 Getting Started</h3><ol><li>Visit the LMS using the login link above.</li><li>Sign in using your username and temporary password.</li><li>Change your temporary password.</li><li>Explore your dashboard and enrolled courses.</li><li>Start your learning journey with BGSB.</li></ol><p>We are excited to have you with us and wish you every success in your studies.</p><p>If you experience any difficulty accessing your account, please contact our support team.</p><p><strong>Welcome to BGSB — Learn. Grow. Achieve. 🎓</strong></p><p>Warm regards,<br>Academic &amp; Student Support Team<br>British Graduate School of Business<br>📧 <a href="mailto:info@bgsb.lk">info@Bgsb.lk</a><br>📱 +94 117 221 192<br>🌐 <a href="https://www.bgsb.lk">www.bgsb.lk</a></p></div>`,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? `Account updated, but email failed: ${error.message}`
            : "Verification email failed",
      },
      { status: 400 },
    );
  }
  const { error } = await admin
    .from("profiles")
    .update({
      verification_status: "verified",
      verified_as: actor.role === "super_admin" ? "super_admin" : staffRole,
      verified_by: user.id,
      verified_at: now,
      status: "active",
    })
    .eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  await admin.from("admin_activity_logs").insert({
    actor_id: user.id,
    action: "verify",
    entity_type: "student",
    entity_id: params.id,
    description: `Verified ${student.full_name} and sent login credentials`,
  });
  return Response.json({
    verification_status: "verified",
    verified_at: now,
  });
}
