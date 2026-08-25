import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { adminActorCan } from "@/lib/staff-permissions";
async function allowed(action: "edit" | "delete") {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return false;
  return adminActorCan(user.id, "curriculum", action);
}
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!(await allowed("edit")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await request.formData(),
    parsed = z
      .object({
        title: z.string().trim().min(2),
        description: z.string().optional(),
        content_type: z.enum(["video", "audio", "document"]),
      })
      .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return Response.json({ error: "Invalid lesson details" }, { status: 400 });
  const admin = createAdminClient(),
    file = form.get("file");
  let content_url: string | undefined;
  if (file instanceof File && file.size) {
    const ext = file.name.split(".").pop()?.toLowerCase(),
      type = parsed.data.content_type;
    if (type === "video" && (file.type !== "video/mp4" || ext !== "mp4"))
      return Response.json(
        { error: "Video lessons require MP4" },
        { status: 400 },
      );
    if (type === "audio" && file.type !== "audio/mpeg" && ext !== "mp3")
      return Response.json(
        { error: "Audio lessons require MP3" },
        { status: 400 },
      );
    if (type === "document" && ["mp3", "mp4"].includes(ext || ""))
      return Response.json(
        { error: "Select a document file" },
        { status: 400 },
      );
    const path = `lessons/replacements/${params.id}-${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "-")}`,
      upload = await admin.storage.from("course-media").upload(path, file, {
        contentType: file.type || "application/octet-stream",
      });
    if (upload.error)
      return Response.json({ error: upload.error.message }, { status: 400 });
    content_url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl;
  }
  const { data, error } = await admin
    .from("lessons")
    .update({ ...parsed.data, ...(content_url ? { content_url } : {}) })
    .eq("id", params.id)
    .select("id,title,content_type,content_url,description,position")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  if (!(await allowed("delete")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("lessons")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
