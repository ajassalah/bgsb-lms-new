import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { randomBytes } from "crypto";
import { sendAccountCredentials } from "@/lib/email";
import { adminActorCan } from "@/lib/staff-permissions";
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
});
async function allowed(module: string, action: string) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return false;
  return adminActorCan(user.id, module, action);
}
export async function POST(req: Request) {
  const form = await req.formData(),
    profileRole =
      form.get("profile_role") === "admin_staff"
        ? ("admin_staff" as const)
        : ("instructor" as const),
    entity = profileRole === "admin_staff" ? "staff" : "instructor",
    parsed = schema.safeParse(Object.fromEntries(form));
  if (
    !(await allowed(
      profileRole === "admin_staff" ? "staff" : "instructors",
      "create",
    ))
  )
    return Response.json({ error: "Forbidden" }, { status: 403 });
  if (!parsed.success)
    return Response.json(
      {
        error: parsed.error.issues[0]?.message || `Invalid ${entity} details`,
      },
      { status: 400 },
    );
  const admin = createAdminClient(),
    temporaryPassword = `Bgsb@${randomBytes(6).toString("base64url")}9`,
    { data: invited, error: inviteError } = await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: `${parsed.data.first_name} ${parsed.data.last_name}`,
        must_change_password: true,
      },
    });
  if (inviteError || !invited.user)
    return Response.json(
      { error: inviteError?.message || `Could not create ${entity}` },
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
      path = `${entity}-profiles/${invited.user.id}-${Date.now()}.${ext}`,
      upload = await admin.storage
        .from("course-media")
        .upload(path, image, { contentType: image.type });
    if (upload.error)
      return Response.json({ error: upload.error.message }, { status: 400 });
    avatar_url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl;
  }
  let resume_url: string | null = null;
  const resume = form.get("resume");
  if (resume instanceof File && resume.size) {
    const ext =
        resume.name
          .split(".")
          .pop()
          ?.replace(/[^a-z0-9]/gi, "") || "pdf",
      path = `${entity}-resumes/${invited.user.id}-${Date.now()}.${ext}`,
      upload = await admin.storage.from("course-media").upload(path, resume, {
        contentType: resume.type || "application/octet-stream",
      });
    if (upload.error)
      return Response.json({ error: upload.error.message }, { status: 400 });
    resume_url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl;
  }
  const d = parsed.data,
    { data, error } = await admin
      .from("profiles")
      .insert({
        id: invited.user.id,
        role: profileRole,
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
        staff_role:
          profileRole === "admin_staff" ? d.staff_role || "Staff" : null,
        resume_url,
        facebook_url: d.facebook_url || null,
        twitter_url: d.twitter_url || null,
        instagram_url: d.instagram_url || null,
        linkedin_url: d.linkedin_url || null,
        youtube_url: d.youtube_url || null,
        avatar_url,
        status: "active",
      })
      .select("id")
      .single();
  if (!error && data && profileRole === "admin_staff" && d.permissions) {
    const permissions = JSON.parse(d.permissions) as Record<
      string,
      Record<string, boolean>
    >;
    await admin.from("admin_permissions").insert(
      Object.entries(permissions).map(([module, flags]) => ({
        admin_staff_id: data.id,
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
      })),
    );
  }
  if (error) return Response.json({ error: error.message }, { status: 400 });
  let email_warning: string | null = null;
  try {
    await sendAccountCredentials({
      to: d.email.toLowerCase(),
      name: `${d.first_name} ${d.last_name}`,
      role: entity,
      staffRole:
        profileRole === "admin_staff" ? d.staff_role || "Staff" : undefined,
      temporaryPassword,
      loginUrl: `${process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin}/login`,
    });
  } catch (mailError) {
    email_warning =
      mailError instanceof Error
        ? mailError.message
        : "Credential email failed";
  }
  return Response.json({
    ...data,
    temporary_password: temporaryPassword,
    email_warning,
  });
}
