import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { adminActorCan } from "@/lib/staff-permissions";
async function authorized(action: string) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return false;
  return adminActorCan(user.id, "students", action);
}
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const admin = createAdminClient();
  if (req.headers.get("content-type")?.includes("application/json")) {
    if (!(await authorized("status")))
      return Response.json({ error: "Forbidden" }, { status: 403 });
    const parsed = z
      .object({ status: z.enum(["active", "suspended"]) })
      .safeParse(await req.json());
    if (!parsed.success)
      return Response.json({ error: "Invalid status" }, { status: 400 });
    const { error } = await admin
      .from("profiles")
      .update(parsed.data)
      .eq("id", params.id)
      .eq("role", "student");
    return error
      ? Response.json({ error: error.message }, { status: 400 })
      : Response.json({ ok: true });
  }
  if (!(await authorized("edit")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData(),
    parsed = z
      .object({
        first_name: z.string().trim().min(1),
        last_name: z.string().trim().min(1),
        address: z.string().trim().min(2),
        date_of_birth: z.string().min(1),
        gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
        country: z.string().min(2),
        about: z.string().optional(),
        nic_passport: z.string().trim().min(2),
        phone_country_code: z.string().min(1),
        phone: z.string().trim().min(5),
        whatsapp_mode: z.enum(["same", "new"]).optional(),
        whatsapp_number: z.string().optional(),
        email: z.string().email(),
        remove_avatar: z.string().optional(),
      })
      .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return Response.json({ error: "Invalid student details" }, { status: 400 });
  let avatar_url: string | undefined;
  const image = form.get("avatar");
  if (image instanceof File && image.size) {
    const ext =
        image.name
          .split(".")
          .pop()
          ?.replace(/[^a-z0-9]/gi, "") || "jpg",
      path = `student-profiles/${params.id}-${Date.now()}.${ext}`,
      upload = await admin.storage
        .from("course-media")
        .upload(path, image, { contentType: image.type });
    if (upload.error)
      return Response.json({ error: upload.error.message }, { status: 400 });
    avatar_url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl;
  }
  const values = {
      full_name: `${parsed.data.first_name} ${parsed.data.last_name}`,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      address: parsed.data.address,
      date_of_birth: parsed.data.date_of_birth,
      gender: parsed.data.gender,
      country: parsed.data.country,
      about: parsed.data.about || null,
      nic_passport: parsed.data.nic_passport,
      phone_country_code: parsed.data.phone_country_code,
      phone: `${parsed.data.phone_country_code}${parsed.data.phone}`,
      whatsapp_number:
        parsed.data.whatsapp_mode === "new"
          ? parsed.data.whatsapp_number || null
          : `${parsed.data.phone_country_code}${parsed.data.phone}`,
      email: parsed.data.email.toLowerCase(),
      ...(avatar_url ? { avatar_url } : {}),
      ...(!avatar_url && parsed.data.remove_avatar === "true"
        ? { avatar_url: null }
        : {}),
    },
    result = await admin
      .from("profiles")
      .update(values)
      .eq("id", params.id)
      .eq("role", "student");
  if (result.error)
    return Response.json({ error: result.error.message }, { status: 400 });
  await admin.auth.admin.updateUserById(params.id, {
    email: parsed.data.email,
    user_metadata: { full_name: values.full_name },
  });
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (user)
    await admin.from("admin_activity_logs").insert({
      actor_id: user.id,
      action: "update",
      entity_type: "student",
      entity_id: params.id,
      description: `Updated student ${values.full_name}`,
    });
  return Response.json({ ok: true });
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  if (!(await authorized("delete")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const admin = createAdminClient();
  const {
    data: { user },
  } = await createClient().auth.getUser();
  for (const [table, column] of [
    ["assignment_submissions", "student_id"],
    ["quiz_attempts", "student_id"],
    ["session_attendance", "student_id"],
    ["certificates", "student_id"],
    ["enrollments", "student_id"],
    ["student_payments", "student_id"],
    ["student_login_history", "student_id"],
  ] as const)
    await admin.from(table).delete().eq(column, params.id);
  const { error } = await admin.auth.admin.deleteUser(params.id);
  if (!error && user)
    await admin.from("admin_activity_logs").insert({
      actor_id: user.id,
      action: "delete",
      entity_type: "student",
      entity_id: params.id,
      description: "Deleted a student account",
    });
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
