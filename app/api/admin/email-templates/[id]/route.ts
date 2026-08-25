import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";
async function ok(action: "edit" | "delete") {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return false;
  return adminActorCan(user.id, "email_templates", action);
}
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await ok("edit")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData(),
    subject = String(form.get("subject") || "").trim(),
    body = String(form.get("body") || "").trim(),
    admin = createAdminClient(),
    file = form.get("attachment");
  let values: any = { subject, body, updated_at: new Date().toISOString() };
  if (file instanceof File && file.size) {
    const path = `email-templates/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "-")}`,
      upload = await admin.storage.from("course-media").upload(path, file, {
        contentType: file.type || "application/octet-stream",
      });
    if (upload.error)
      return Response.json({ error: upload.error.message }, { status: 400 });
    values.attachment_url = admin.storage
      .from("course-media")
      .getPublicUrl(path).data.publicUrl;
    values.attachment_name = file.name;
  }
  const { error } = await admin
    .from("email_templates")
    .update(values)
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  if (!(await ok("delete")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("email_templates")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
