import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export async function PATCH(req: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData(),
    parsed = z
      .object({
        first_name: z.string().trim().min(1),
        last_name: z.string().trim().min(1),
        phone_country_code: z.string().min(1),
        phone: z.string().trim().min(5),
        address: z.string().trim().min(2),
      })
      .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return Response.json({ error: "Invalid profile details" }, { status: 400 });
  const admin = createAdminClient(),
    d = parsed.data,
    values: Record<string, unknown> = {
      ...d,
      full_name: `${d.first_name} ${d.last_name}`,
      phone: `${d.phone_country_code}${d.phone}`,
    },
    file = form.get("avatar");
  if (file instanceof File && file.size) {
    const ext =
        file.name
          .split(".")
          .pop()
          ?.replace(/[^a-z0-9]/gi, "") || "jpg",
      path = `admin-profiles/${user.id}-${Date.now()}.${ext}`,
      { error } = await admin.storage
        .from("course-media")
        .upload(path, file, { contentType: file.type });
    if (error) return Response.json({ error: error.message }, { status: 400 });
    values.avatar_url = admin.storage
      .from("course-media")
      .getPublicUrl(path).data.publicUrl;
  }
  const { error } = await admin
    .from("profiles")
    .update(values)
    .eq("id", user.id);
  if (!error)
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { full_name: values.full_name },
    });
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
