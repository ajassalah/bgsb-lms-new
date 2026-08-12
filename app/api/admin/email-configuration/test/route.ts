import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { emailTransport, getEmailConfiguration } from "@/lib/email";

export async function POST(request: Request) {
  const db = createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "super_admin") return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z.object({ email: z.string().email() }).safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Enter a valid test recipient email" }, { status: 400 });
  const config = await getEmailConfiguration();
  if (!config?.smtp_host || !config.from_email) return Response.json({ error: "Save SMTP configuration first" }, { status: 400 });
  try {
    const transport = emailTransport(config);
    await transport.verify();
    await transport.sendMail({ from: `${config.from_name} <${config.from_email}>`, to: parsed.data.email, subject: "BGSB LMS SMTP test", html: "<h2>Email configuration works</h2><p>This test message confirms that your BGSB LMS SMTP configuration can send email.</p>" });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? `SMTP test failed: ${error.message}` : "SMTP test failed" }, { status: 400 });
  }
}
