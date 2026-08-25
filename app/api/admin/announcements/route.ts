import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";

async function auth() {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return null;
  return (await adminActorCan(user.id, "announcements", "create"))
    ? user
    : null;
}
export async function POST(req: Request) {
  const user = await auth();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData(),
    receivers = form.getAll("receiver_types").map(String),
    parsed = z
      .object({
        title: z.string().trim().min(2),
        body: z.string().trim().min(2),
        scheduled_at: z.string().optional(),
      })
      .safeParse(Object.fromEntries(form));
  if (!parsed.success || !receivers.length)
    return Response.json(
      { error: "Enter announcement details and receivers" },
      { status: 400 },
    );
  const admin = createAdminClient();
  let attachment_url: string | null = null;
  const file = form.get("attachment");
  if (file instanceof File && file.size) {
    const path = `announcements/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "-")}`,
      { error } = await admin.storage.from("course-media").upload(path, file, {
        contentType: file.type || "application/octet-stream",
      });
    if (error) return Response.json({ error: error.message }, { status: 400 });
    attachment_url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl;
  }
  const { data, error } = await admin
    .from("announcements")
    .insert({
      title: parsed.data.title,
      body: parsed.data.body,
      scheduled_at: parsed.data.scheduled_at
        ? new Date(parsed.data.scheduled_at).toISOString()
        : null,
      receiver_types: receivers,
      attachment_url,
      posted_by: user.id,
    })
    .select("id")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
