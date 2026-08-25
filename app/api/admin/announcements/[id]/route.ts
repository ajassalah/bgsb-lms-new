import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";

async function allowed(action: "edit" | "delete") {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return false;
  return adminActorCan(user.id, "announcements", action);
}
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await allowed("edit")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
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
    return Response.json({ error: "Invalid announcement" }, { status: 400 });
  const admin = createAdminClient(),
    changes: Record<string, unknown> = {
      title: parsed.data.title,
      body: parsed.data.body,
      scheduled_at: parsed.data.scheduled_at
        ? new Date(parsed.data.scheduled_at).toISOString()
        : null,
      receiver_types: receivers,
      updated_at: new Date().toISOString(),
    };
  const file = form.get("attachment");
  if (file instanceof File && file.size) {
    const path = `announcements/${params.id}-${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "-")}`,
      { error } = await admin.storage.from("course-media").upload(path, file, {
        contentType: file.type || "application/octet-stream",
      });
    if (error) return Response.json({ error: error.message }, { status: 400 });
    changes.attachment_url = admin.storage
      .from("course-media")
      .getPublicUrl(path).data.publicUrl;
  }
  const { error } = await admin
    .from("announcements")
    .update(changes)
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  if (!(await allowed("delete")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("announcements")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
