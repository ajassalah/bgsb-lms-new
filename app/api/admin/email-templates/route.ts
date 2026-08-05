import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
async function auth() {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return null;
  const { data: p } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return p && ["super_admin", "admin_staff"].includes(p.role) ? user : null;
}
export async function POST(req: Request) {
  const user = await auth();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData(),
    subject = String(form.get("subject") || "").trim(),
    body = String(form.get("body") || "").trim();
  if (subject.length < 2 || body.length < 2)
    return Response.json(
      { error: "Enter subject and response content" },
      { status: 400 },
    );
  const admin = createAdminClient(),
    file = form.get("attachment");
  let attachment_url = null,
    attachment_name = null;
  if (file instanceof File && file.size) {
    const path = `email-templates/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "-")}`,
      upload = await admin.storage
        .from("course-media")
        .upload(path, file, {
          contentType: file.type || "application/octet-stream",
        });
    if (upload.error)
      return Response.json({ error: upload.error.message }, { status: 400 });
    attachment_url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl;
    attachment_name = file.name;
  }
  const { data, error } = await admin
    .from("email_templates")
    .insert({
      subject,
      body,
      attachment_url,
      attachment_name,
      created_by: user.id,
    })
    .select("id")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
