import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
export async function PUT(req: Request) {
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
    .object({
      smtp_host: z
        .string()
        .trim()
        .min(1)
        .refine(
          (value) => !value.includes("@") && !/^https?:\/\//i.test(value),
          "SMTP Host must be a server hostname, for example mail.example.com",
        ),
      smtp_port: z.coerce.number().int().positive(),
      smtp_username: z.string(),
      smtp_password: z.string(),
      from_name: z.string().min(1),
      from_email: z.string().email(),
      encryption: z.enum(["none", "ssl", "tls"]),
    })
    .safeParse(await req.json());
  if (!parsed.success)
    return Response.json(
      {
        error:
          parsed.error.issues[0]?.message || "Enter valid email configuration",
      },
      { status: 400 },
    );
  const { error } = await db
    .from("email_configuration")
    .upsert({ id: 1, ...parsed.data, updated_at: new Date().toISOString() });
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
