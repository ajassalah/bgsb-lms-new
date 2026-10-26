import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { staffCan } from "@/lib/staff-permissions";

async function canManageTemplate(userId: string, role?: string) {
  if (role === "super_admin") return true;
  if (role !== "admin_staff") return false;
  return (
    (await staffCan(userId, "certificates", "add_certificate")) ||
    (await staffCan(userId, "certificates", "manage_certificate"))
  );
}

export async function POST(req: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data: p } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!(await canManageTemplate(user.id, p?.role)))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData(),
    parsed = z
      .object({ course_id: z.string().uuid(), title: z.string().trim().min(2) })
      .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return Response.json(
      { error: "Invalid certificate details" },
      { status: 400 },
    );
  const admin = createAdminClient(),
    file = form.get("file");
  let url: string | undefined;
  if (file instanceof File && file.size) {
    const ext =
        file.name
          .split(".")
          .pop()
          ?.replace(/[^a-z0-9]/gi, "") || "bin",
      path = `${parsed.data.course_id}/template-${Date.now()}.${ext}`;
    const { error } = await admin.storage
      .from("certificate-templates")
      .upload(path, file, { contentType: file.type });
    if (error) return Response.json({ error: error.message }, { status: 400 });
    url = admin.storage.from("certificate-templates").getPublicUrl(path)
      .data.publicUrl;
  } else {
    const { data } = await admin
      .from("certificate_templates")
      .select("certificate_url")
      .eq("course_id", parsed.data.course_id)
      .single();
    url = data?.certificate_url;
  }
  if (!url)
    return Response.json(
      { error: "Upload a certificate template" },
      { status: 400 },
    );
  const now = new Date().toISOString(),
    { data, error } = await admin
      .from("certificate_templates")
      .upsert(
        {
          course_id: parsed.data.course_id,
          title: parsed.data.title,
          certificate_url: url,
          created_by: user.id,
          added_at: now,
          updated_at: now,
        },
        { onConflict: "course_id" },
      )
      .select("id,title,certificate_url,added_at")
      .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({
        templateId: data.id,
        title: data.title,
        url: data.certificate_url,
        addedAt: data.added_at,
      });
}
