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

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await authorize();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json(),
    parsed = z
      .union([
        z.object({
          status: z.enum(["open", "pending", "answered", "on_hold", "closed"]),
        }),
        z.object({ reply: z.string().trim().min(2) }),
      ])
      .safeParse(body);
  if (!parsed.success)
    return Response.json({ error: "Invalid ticket update" }, { status: 400 });
  const admin = createAdminClient();
  if ("reply" in parsed.data) {
    const { error } = await admin.from("support_ticket_replies").insert({
      ticket_id: params.id,
      message: parsed.data.reply,
      replied_by: user.id,
    });
    if (!error)
      await admin
        .from("support_tickets")
        .update({
          status: "answered",
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id);
    return error
      ? Response.json({ error: error.message }, { status: 400 })
      : Response.json({ status: "answered" });
  }
  const { error } = await admin
    .from("support_tickets")
    .update({
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ status: parsed.data.status });
}
