import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { adminActorCan } from "@/lib/staff-permissions";
async function authorized(action: string) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return null;
  return (await adminActorCan(user.id, "courses", action)) ? user : null;
}
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (req.headers.get("content-type")?.includes("application/json")) {
    if (!(await authorized("published_toggle")))
      return Response.json({ error: "Forbidden" }, { status: 403 });
    const update = z
      .object({ status: z.enum(["draft", "published", "archived"]) })
      .safeParse(await req.json());
    if (!update.success)
      return Response.json({ error: "Invalid status" }, { status: 400 });
    const { error } = await createAdminClient()
      .from("courses")
      .update(update.data)
      .eq("id", params.id);
    return error
      ? Response.json({ error: error.message }, { status: 400 })
      : Response.json({ ok: true });
  }
  if (!(await authorized("edit")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData(),
    parsed = z
      .object({
        title: z.string().trim().min(2),
        category_id: z.string().optional(),
        course_type: z.enum(["online", "onsite", "hybrid"]),
        language: z.string().min(1),
        instructor_id: z.string().optional(),
        instructor_ids: z.string().optional(),
        duration_weeks: z.coerce.number().int().positive(),
        tags: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]),
        short_description: z.string().min(2),
        description: z.string().optional(),
        video_source: z.enum(["upload", "youtube"]),
        video_link: z.string().optional(),
        remove_thumbnail: z.string().optional(),
        remove_video: z.string().optional(),
      })
      .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return Response.json({ error: "Invalid course details" }, { status: 400 });
  const admin = createAdminClient();
  async function upload(name: "video" | "thumbnail") {
    const file = form.get(name);
    if (!(file instanceof File) || !file.size) return undefined;
    const ext =
        file.name
          .split(".")
          .pop()
          ?.replace(/[^a-z0-9]/gi, "") || "bin",
      path = `course-updates/${params.id}/${name}-${Date.now()}.${ext}`,
      { error } = await admin.storage
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
    const thumbnail_url = await upload("thumbnail"),
      uploaded = await upload("video"),
      values: any = {
        title: parsed.data.title,
        category_id: parsed.data.category_id || null,
        course_type: parsed.data.course_type,
        language: parsed.data.language,
        instructor_id: instructorIds[0] || null,
        duration_weeks: parsed.data.duration_weeks,
        tags: (parsed.data.tags || "")
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
        status: parsed.data.status,
        short_description: parsed.data.short_description,
        description: parsed.data.description || "",
        video_source: parsed.data.video_source,
      };
    if (thumbnail_url) values.thumbnail_url = thumbnail_url;
    else if (parsed.data.remove_thumbnail === "true")
      values.thumbnail_url = null;
    if (uploaded || parsed.data.video_source === "youtube")
      values.video_url = uploaded || parsed.data.video_link || null;
    else if (parsed.data.remove_video === "true") values.video_url = null;
    const { error } = await admin
      .from("courses")
      .update(values)
      .eq("id", params.id);
    if (error) return Response.json({ error: error.message }, { status: 400 });
    await admin.from("course_instructors").delete().eq("course_id", params.id);
    if (instructorIds.length) {
      const {
        data: { user },
      } = await createClient().auth.getUser();
      const { error: assignmentError } = await admin
        .from("course_instructors")
        .insert(
          instructorIds.map((instructor_id) => ({
            course_id: params.id,
            instructor_id,
            assigned_by: user?.id || null,
          })),
        );
      if (assignmentError)
        return Response.json(
          { error: assignmentError.message },
          { status: 400 },
        );
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Update failed" },
      { status: 400 },
    );
  }
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  if (!(await authorized("delete")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("courses")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
