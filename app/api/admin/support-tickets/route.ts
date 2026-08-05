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

export async function POST(req: Request) {
  const user = await authorize();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData(),
    parsed = z
      .object({
        student_id: z.string().uuid(),
        subject: z.string().trim().min(2),
        priority: z.enum(["low", "medium", "high"]),
        status: z.enum(["open", "pending", "answered", "on_hold", "closed"]),
        description: z.string().trim().min(2),
      })
      .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message || "Invalid ticket details" },
      { status: 400 },
    );
  const admin = createAdminClient(),
    { data: student } = await admin
      .from("profiles")
      .select("id")
      .eq("id", parsed.data.student_id)
      .eq("role", "student")
      .single();
  if (!student)
    return Response.json({ error: "Select a valid student" }, { status: 400 });
  let attachment_url: string | null = null;
  const file = form.get("attachment");
  if (file instanceof File && file.size) {
    const safeName = file.name.replace(/[^a-z0-9.-]/gi, "-"),
      path = `support-tickets/${parsed.data.student_id}/${Date.now()}-${safeName}`,
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
  const { data, error } = await admin
    .from("support_tickets")
    .insert({
      ...parsed.data,
      attachment_url,
      created_by: user.id,
    })
    .select("id")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
