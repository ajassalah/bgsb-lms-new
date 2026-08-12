import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { adminActorCan } from "@/lib/staff-permissions";
async function allowed(module: string, action: string) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return false;
  return adminActorCan(user.id, module, action);
}
const schema = z.object({
  first_name: z.string().trim().min(1),
  last_name: z.string().trim().min(1),
  phone_country_code: z.string().min(1),
  phone: z.string().trim().min(5),
  whatsapp_mode: z.enum(["same", "new"]).optional(),
  whatsapp_number: z.string().optional(),
  email: z.string().email(),
  organization_id: z.string().uuid().or(z.literal("")).optional(),
  designation: z.string().trim().min(2),
  website: z.string().optional(),
  expertises: z.string().trim().min(2),
  address: z.string().trim().min(2),
  country: z.string().min(2),
  about: z.string().trim().min(2),
  nic_passport: z.string().trim().min(2),
  date_of_birth: z.string().min(1),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  education_background: z.string(),
  professional_details: z.string(),
  staff_role: z.string().optional(),
  permissions: z.string().optional(),
  facebook_url: z.string().optional(),
  twitter_url: z.string().optional(),
  instagram_url: z.string().optional(),
  linkedin_url: z.string().optional(),
  youtube_url: z.string().optional(),
  remove_avatar: z.string().optional(),
});
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const profileRole =
    new URL(req.url).searchParams.get("role") === "admin_staff"
      ? "admin_staff"
      : "instructor";
  const module = profileRole === "admin_staff" ? "staff" : "instructors";
  const action = req.headers.get("content-type")?.includes("application/json")
    ? "status"
    : "edit";
  if (!(await allowed(module, action)))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const admin = createAdminClient(),
    entity = profileRole === "admin_staff" ? "staff" : "instructor";
  if (req.headers.get("content-type")?.includes("application/json")) {
    const parsed = z
      .object({ status: z.enum(["active", "suspended"]) })
      .safeParse(await req.json());
    if (!parsed.success)
      return Response.json({ error: "Invalid status" }, { status: 400 });
    const { error } = await admin
      .from("profiles")
      .update(parsed.data)
      .eq("id", params.id)
      .eq("role", profileRole);
    return error
      ? Response.json({ error: error.message }, { status: 400 })
      : Response.json({ ok: true });
  }
  const form = await req.formData(),
    parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return Response.json(
      { error: "Invalid instructor details" },
      { status: 400 },
    );
  let avatar_url: string | undefined;
  const image = form.get("avatar");
  if (image instanceof File && image.size) {
    const ext =
        image.name
          .split(".")
          .pop()
          ?.replace(/[^a-z0-9]/gi, "") || "jpg",
      path = `${entity}-profiles/${params.id}-${Date.now()}.${ext}`,
      upload = await admin.storage
        .from("course-media")
        .upload(path, image, { contentType: image.type });
    if (upload.error)
      return Response.json({ error: upload.error.message }, { status: 400 });
    avatar_url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl;
  }
  let resume_url: string | undefined;
  const resume = form.get("resume");
  if (resume instanceof File && resume.size) {
    const ext =
        resume.name
          .split(".")
          .pop()
          ?.replace(/[^a-z0-9]/gi, "") || "pdf",
      path = `${entity}-resumes/${params.id}-${Date.now()}.${ext}`,
      upload = await admin.storage.from("course-media").upload(path, resume, {
        contentType: resume.type || "application/octet-stream",
      });
    if (upload.error)
      return Response.json({ error: upload.error.message }, { status: 400 });
    resume_url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl;
  }
  const d = parsed.data,
    values = {
      full_name: `${d.first_name} ${d.last_name}`,
      first_name: d.first_name,
      last_name: d.last_name,
      phone_country_code: d.phone_country_code,
      phone: `${d.phone_country_code}${d.phone}`,
      whatsapp_number:
        d.whatsapp_mode === "new"
          ? d.whatsapp_number || null
          : `${d.phone_country_code}${d.phone}`,
      email: d.email.toLowerCase(),
      organization_id: d.organization_id || null,
      designation: d.designation,
      website: d.website || null,
      expertises: d.expertises
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      address: d.address,
      country: d.country,
      about: d.about,
      nic_passport: d.nic_passport,
      date_of_birth: d.date_of_birth,
      gender: d.gender,
      education_background: JSON.parse(d.education_background),
      professional_details: JSON.parse(d.professional_details),
      ...(profileRole === "admin_staff"
        ? { staff_role: d.staff_role || "Staff" }
        : {}),
      ...(resume_url ? { resume_url } : {}),
      facebook_url: d.facebook_url || null,
      twitter_url: d.twitter_url || null,
      instagram_url: d.instagram_url || null,
      linkedin_url: d.linkedin_url || null,
      youtube_url: d.youtube_url || null,
      ...(avatar_url ? { avatar_url } : {}),
      ...(!avatar_url && d.remove_avatar === "true"
        ? { avatar_url: null }
        : {}),
    },
    result = await admin
      .from("profiles")
      .update(values)
      .eq("id", params.id)
      .eq("role", profileRole);
  if (result.error)
    return Response.json({ error: result.error.message }, { status: 400 });
  if (profileRole === "admin_staff" && d.permissions) {
    const permissions = JSON.parse(d.permissions) as Record<
      string,
      Record<string, boolean>
    >;
    await admin
      .from("admin_permissions")
      .delete()
      .eq("admin_staff_id", params.id);
    const rows = Object.entries(permissions).map(([module, flags]) => ({
      admin_staff_id: params.id,
      module,
      actions: flags,
      can_view: Object.values(flags).some(Boolean),
      can_create: [
        "create",
        "bulk_import",
        "add_assignment",
        "add_lesson",
        "add_certificate",
        "upload_file",
        "create_folder",
      ].some((action) => flags[action]),
      can_edit: [
        "edit",
        "status",
        "verification",
        "verify_status",
        "check",
        "published_toggle",
        "reply",
      ].some((action) => flags[action]),
      can_delete: !!flags.delete || !!flags.remove_certificate,
    }));
    if (rows.length) await admin.from("admin_permissions").insert(rows);
  }
  await admin.auth.admin.updateUserById(params.id, {
    email: d.email,
    user_metadata: { full_name: values.full_name },
  });
  return Response.json({ ok: true });
}
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const profileRole =
    new URL(req.url).searchParams.get("role") === "admin_staff"
      ? "admin_staff"
      : "instructor";
  if (
    !(await allowed(
      profileRole === "admin_staff" ? "staff" : "instructors",
      "delete",
    ))
  )
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const admin = createAdminClient();
  if (profileRole === "instructor") {
    await admin
      .from("live_sessions")
      .update({ instructor_id: null })
      .eq("instructor_id", params.id);
    await admin
      .from("courses")
      .update({ instructor_id: null })
      .eq("instructor_id", params.id);
    await admin
      .from("assignments")
      .update({ instructor_id: null })
      .eq("instructor_id", params.id);
  }
  const { error } = await admin.auth.admin.deleteUser(params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
