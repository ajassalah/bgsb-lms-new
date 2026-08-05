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

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await authorize();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData(),
    parsed = z
      .object({
        status: z.enum(["closed", "answered"]),
        response: z.string().trim().min(2),
      })
      .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return Response.json(
      { error: "Enter a valid response and status" },
      { status: 400 },
    );
  const admin = createAdminClient();
  let attachment_url: string | null = null;
  const file = form.get("attachment");
  if (file instanceof File && file.size) {
    const safeName = file.name.replace(/[^a-z0-9.-]/gi, "-"),
      path = `support-replies/${params.id}/${Date.now()}-${safeName}`,
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
  const { error } = await admin.from("support_ticket_replies").insert({
    ticket_id: params.id,
    message: parsed.data.response,
    attachment_url,
    replied_by: user.id,
  });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const { error: updateError } = await admin
    .from("support_tickets")
    .update({
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id);
  return updateError
    ? Response.json({ error: updateError.message }, { status: 400 })
    : Response.json({ ok: true });
}
