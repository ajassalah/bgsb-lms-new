import nodemailer from "nodemailer";
import { createAdminClient } from "@/lib/supabase/admin";

export type EmailConfiguration = {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string | null;
  smtp_password: string | null;
  from_name: string;
  from_email: string;
  encryption: "none" | "ssl" | "tls";
};

export async function getEmailConfiguration() {
  const { data } = await createAdminClient()
    .from("email_configuration")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  return data as EmailConfiguration | null;
}

export function emailTransport(config: EmailConfiguration) {
  return nodemailer.createTransport({
    host: config.smtp_host,
    port: config.smtp_port,
    secure: config.encryption === "ssl",
    auth: config.smtp_username
      ? { user: config.smtp_username, pass: config.smtp_password || "" }
      : undefined,
    requireTLS: config.encryption === "tls",
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
}

export async function sendAccountCredentials({
  to,
  name,
  role,
  temporaryPassword,
  loginUrl,
  staffRole,
}: {
  to: string;
  name: string;
  role: string;
  temporaryPassword: string;
  loginUrl: string;
  staffRole?: string;
}) {
  const config = await getEmailConfiguration();
  if (!config?.smtp_host || !config.from_email)
    throw new Error("SMTP email configuration is incomplete");
  const safeName = name.replace(
    /[&<>"']/g,
    (character: string) =>
      (
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        }) as Record<string, string>
      )[character]!,
  );
  const instructor = role.toLowerCase() === "instructor",
    staff = role.toLowerCase() === "staff",
    safeStaffRole = (staffRole || "Staff").replace(
      /[&<>"']/g,
      (character: string) =>
        (
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
          }) as Record<string, string>
        )[character]!,
    );
  await emailTransport(config).sendMail({
    from: `${config.from_name} <${config.from_email}>`,
    to,
    subject: instructor
      ? "\u{1F393} Welcome to British Graduate School of Business (BGSB) LMS \u2013 Your Instructor Account Is Ready"
      : staff
        ? "Welcome to the BGSB LMS \u2013 Your Staff Account Is Ready."
        : `Your BGSB ${role} account`,
    html: instructor
      ? `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#172033;line-height:1.65"><h2>Welcome to the British Graduate School of Business LMS, ${safeName}! &#127891;</h2><p>Dear <strong>${safeName}</strong>,</p><p>We are pleased to welcome you to the <strong>British Graduate School of Business (BGSB)</strong> as an Instructor.</p><p>Your instructor account has been successfully created and verified. You can now access the Learning Management System (LMS) and begin managing your assigned courses, learning materials, students, and academic activities.</p><h3>&#128272; Your LMS Login Details</h3><div style="padding:16px;background:#f4f7fb;border-radius:10px"><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a><br><strong>Username:</strong> ${to}<br><strong>Temporary Password:</strong> ${temporaryPassword}</div><p>For your security, please sign in and change your temporary password immediately after your first login.</p><h3>&#128104;&#8205;&#127979; What You Can Do Through the LMS</h3><p>As an instructor, you can:</p><ul><li>Access your assigned courses</li><li>Manage course content and learning materials</li><li>View and manage enrolled students</li><li>Upload lectures, documents, and resources</li><li>Create and manage assignments</li><li>Review and grade student submissions</li><li>Monitor student learning progress</li><li>Post course announcements</li><li>Communicate with students</li><li>Manage your academic activities</li></ul><h3>&#128640; Getting Started</h3><ol><li>Visit the LMS using the login link above.</li><li>Sign in using your username and temporary password.</li><li>Change your temporary password.</li><li>Review your instructor dashboard.</li><li>Check your assigned courses and students.</li><li>Start managing your teaching activities.</li></ol><p>We are delighted to have you join the BGSB academic team and look forward to your contribution to our students&apos; learning and development.</p><p><strong>Welcome to BGSB &mdash; Inspire. Teach. Empower. &#127891;</strong></p><p>Warm regards,<br>Academic &amp; LMS Administration Team<br>British Graduate School of Business<br>&#128231; <a href="mailto:info@bgsb.lk">info@Bgsb.lk</a><br>&#128241; +94 117 221 192<br>&#127760; <a href="http://www.bgsb.lk">www.bgsb.lk</a></p></div>`
      : staff
        ? `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#172033;line-height:1.65"><h2>Welcome to the BGSB LMS, ${safeName}! &#128075;</h2><p>Dear <strong>${safeName}</strong>,</p><p>Welcome to the British Graduate School of Business (BGSB) Learning Management System.</p><p>Your staff account has been successfully created. You have been assigned the following role:</p><p><strong>Role: ${safeStaffRole}</strong></p><p>You can now access the LMS portal and use the features available to your role.</p><h3>&#128272; Your Login Details</h3><div style="padding:16px;background:#f4f7fb;border-radius:10px"><strong>LMS Login:</strong> <a href="${loginUrl}">${loginUrl}</a><br><strong>Username:</strong> ${to}<br><strong>Temporary Password:</strong> ${temporaryPassword}<br><strong>Role:</strong> ${safeStaffRole}</div><p>Please log in and change your temporary password after your first login.</p><h3>Your LMS Access</h3><p>Based on your assigned role, you may be able to:</p><ul><li>Manage assigned courses</li><li>Manage students</li><li>Upload and manage learning materials</li><li>Create and manage assignments</li><li>Manage classes and lessons</li><li>Communicate with students</li><li>View academic information and reports</li></ul><p>Your available features will depend on your assigned permissions.</p><p>Welcome to the BGSB LMS team. We look forward to working with you!</p><p>Best regards,<br><br>Academic &amp; LMS Administration Team<br>British Graduate School of Business<br>&#128231; <a href="mailto:info@bgsb.lk">info@Bgsb.lk</a><br>&#128241; +94 117 221 192<br>&#127760; <a href="http://www.bgsb.lk">www.bgsb.lk</a></p></div>`
        : `<h2>Welcome ${safeName}</h2><p>Your BGSB ${role} account is ready.</p><p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a><br><strong>Login email:</strong> ${to}<br><strong>Temporary password:</strong> ${temporaryPassword}</p><p>Please sign in and change your temporary password immediately.</p>`,
  });
}
