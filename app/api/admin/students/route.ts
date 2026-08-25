import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { randomBytes } from "crypto";
import { adminActorCan } from "@/lib/staff-permissions";
export async function POST(req: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await adminActorCan(user.id, "students", "create")))
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
        nic_passport: z.string().trim().optional(),
        phone_country_code: z.string().min(1),
        phone: z.string().trim().min(5),
        whatsapp_mode: z.enum(["same", "new"]).optional(),
        whatsapp_number: z.string().optional(),
        email: z.string().email(),
      })
      .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message || "Invalid student details" },
      { status: 400 },
    );
  const admin = createAdminClient(),
    { data: invited, error: inviteError } = await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: `Pending@${randomBytes(12).toString("base64url")}`,
      email_confirm: false,
      user_metadata: {
        full_name: `${parsed.data.first_name} ${parsed.data.last_name}`,
      },
    });
  if (inviteError || !invited.user)
    return Response.json(
      { error: inviteError?.message || "Could not create student account" },
      { status: 400 },
    );
  let avatar_url: string | null = null;
  const image = form.get("avatar");
  if (image instanceof File && image.size) {
    const ext =
        image.name
          .split(".")
          .pop()
          ?.replace(/[^a-z0-9]/gi, "") || "jpg",
      path = `student-profiles/${invited.user.id}-${Date.now()}.${ext}`,
      upload = await admin.storage
        .from("course-media")
        .upload(path, image, { contentType: image.type });
    if (upload.error)
      return Response.json({ error: upload.error.message }, { status: 400 });
    avatar_url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl;
  }
  const values = {
      id: invited.user.id,
      role: "student",
      full_name: `${parsed.data.first_name} ${parsed.data.last_name}`,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      address: parsed.data.address,
      date_of_birth: parsed.data.date_of_birth,
      gender: parsed.data.gender,
      country: parsed.data.country,
      about: parsed.data.about || null,
      nic_passport: parsed.data.nic_passport || null,
      phone_country_code: parsed.data.phone_country_code,
      phone: `${parsed.data.phone_country_code}${parsed.data.phone}`,
      whatsapp_number:
        parsed.data.whatsapp_mode === "new"
          ? parsed.data.whatsapp_number || null
          : `${parsed.data.phone_country_code}${parsed.data.phone}`,
      email: parsed.data.email.toLowerCase(),
      avatar_url,
      status: "active",
      verification_status: "pending",
    },
    result = await admin
      .from("profiles")
      .insert(values)
      .select("id,full_name,email,phone,country,status,avatar_url")
      .single();
  if (result.error)
    return Response.json({ error: result.error.message }, { status: 400 });
  await admin.from("admin_activity_logs").insert({
    actor_id: user.id,
    action: "create",
    entity_type: "student",
    entity_id: result.data.id,
    description: `Created student ${values.full_name}`,
  });
  return Response.json(result.data);
}
