import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { adminActorCan } from "@/lib/staff-permissions";
export async function POST(req: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await adminActorCan(user.id, "courses", "create")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData(),
    parsed = z
      .object({
        title: z.string().trim().min(2),
        category_id: z.string().optional(),
        course_type: z.enum(["online", "onsite", "hybrid"]),
        language: z.string().min(1),
        organization_id: z.string().optional(),
        instructor_id: z.string().optional(),
        instructor_ids: z.string().optional(),
        duration_weeks: z.coerce.number().int().positive(),
        short_description: z.string().min(5),
        description: z.string().optional(),
        video_source: z.enum(["upload", "youtube"]),
        video_link: z.string().optional(),
      })
      .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues[0]?.message || "Invalid course" },
      { status: 400 },
    );
  const admin = createAdminClient(),
    slug = `${parsed.data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
  async function upload(name: "video" | "thumbnail") {
    const file = form.get(name);
    if (!(file instanceof File) || !file.size) return null;
    const ext =
        file.name
          .split(".")
          .pop()
          ?.replace(/[^a-z0-9]/gi, "") || "bin",
      path = `${slug}/${name}-${Date.now()}.${ext}`;
    const { error } = await admin.storage
      .from("course-media")
      .upload(path, file, { contentType: file.type });
    if (error) throw error;
    return admin.storage.from("course-media").getPublicUrl(path).data.publicUrl;
  }
  try {
    const instructorIds = z
      .array(z.string().uuid())
      .catch([])
      .parse(JSON.parse(parsed.data.instructor_ids || "[]"));
    const thumbnail = await upload("thumbnail"),
      uploadedVideo =
        parsed.data.video_source === "upload" ? await upload("video") : null,
      { data, error } = await admin
        .from("courses")
        .insert({
          title: parsed.data.title,
          slug,
          category_id: parsed.data.category_id || null,
          course_type: parsed.data.course_type,
          language: parsed.data.language,
          organization_id: parsed.data.organization_id || null,
          instructor_id: instructorIds[0] || null,
          duration_weeks: parsed.data.duration_weeks,
          tags: [],
          short_description: parsed.data.short_description,
          description: parsed.data.description || parsed.data.short_description,
          video_source: parsed.data.video_source,
          video_url: uploadedVideo || parsed.data.video_link || null,
          thumbnail_url: thumbnail,
          status: "draft",
        })
        .select("id")
        .single();
    if (error) throw error;
    if (instructorIds.length) {
      const { error: assignmentError } = await admin
        .from("course_instructors")
        .insert(
          instructorIds.map((instructor_id) => ({
            course_id: data.id,
            instructor_id,
            assigned_by: user.id,
          })),
        );
      if (assignmentError) throw assignmentError;
    }
    return Response.json(data);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Course creation failed",
      },
      { status: 400 },
    );
  }
}
