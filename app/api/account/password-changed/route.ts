import { emailTransport, getEmailConfiguration } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] || character,
  );
}

export async function POST(request: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user?.email)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await db
    .from("profiles")
    .select("full_name,role")
    .eq("id", user.id)
    .maybeSingle();
  if (
    !profile ||
    !["student", "instructor", "admin_staff"].includes(profile.role)
  )
    return Response.json(
      { error: "Unsupported account role" },
      { status: 403 },
    );

  const role =
      profile.role === "admin_staff"
        ? "Staff"
        : profile.role === "instructor"
          ? "Instructor"
          : "Student",
    config = await getEmailConfiguration();
  if (!config?.smtp_host || !config.from_email)
    return Response.json(
      { error: "SMTP email configuration is incomplete" },
      { status: 503 },
    );
  const name = escapeHtml(profile.full_name || role),
    email = escapeHtml(user.email),
    loginUrl = `${getSiteUrl(request)}/login`;
  try {
    await emailTransport(config).sendMail({
      from: `${config.from_name} <${config.from_email}>`,
      to: user.email,
      subject: "Your LMS Password Has Been Updated",
      html: `<div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#172033;line-height:1.65"><p>Dear <strong>${name}</strong>,</p><p>Your password for the British Graduates School of Business <strong>LMS</strong> has been successfully changed.</p><p>You can now log in to your LMS account using your new password.</p><h3>Login Details:</h3><ul><li><strong>Username/Email:</strong> ${email}</li><li><strong>Role:</strong> ${role}</li><li><strong>LMS Portal:</strong> <a href="${loginUrl}">${loginUrl}</a></li></ul><p>For your security, please do not share your password with anyone.</p><p>If you did not make this password change, please contact the LMS Administration Team immediately.</p><p>Best regards,<br><strong>British Graduates School of Business</strong><br><strong>LMS Administration Team</strong><br><a href="mailto:info@bgsb.lk">info@bgsb.lk</a> | +94 76 922 3741<br><a href="https://bgsb.lk">bgsb.lk</a></p></div>`,
    });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Password email failed",
      },
      { status: 502 },
    );
  }
}
