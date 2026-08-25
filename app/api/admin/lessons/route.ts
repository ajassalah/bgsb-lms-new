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
  if (!(await adminActorCan(user.id, "curriculum", "add_lesson")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData(),
    parsed = z
      .object({
        module_id: z.string().uuid(),
        title: z.string().trim().min(2),
        description: z.string().optional(),
        content_type: z.enum(["video", "audio", "document"]),
      })
      .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return Response.json({ error: "Invalid lesson details" }, { status: 400 });
  const file = form.get("file");
  if (!(file instanceof File) || !file.size)
    return Response.json({ error: "Select a file to upload" }, { status: 400 });
  const ext = file.name.split(".").pop()?.toLowerCase(),
    type = parsed.data.content_type;
  if (type === "video" && (file.type !== "video/mp4" || ext !== "mp4"))
    return Response.json(
      { error: "Video lessons require an MP4 file" },
      { status: 400 },
    );
  if (type === "audio" && file.type !== "audio/mpeg" && ext !== "mp3")
    return Response.json(
      { error: "Audio lessons require an MP3 file" },
      { status: 400 },
    );
  if (
    type === "document" &&
    (["mp3", "mp4"].includes(ext || "") ||
      ["audio/mpeg", "video/mp4"].includes(file.type))
  )
    return Response.json(
      { error: "MP3 and MP4 files must use Audio or Video Lesson" },
      { status: 400 },
    );
  const admin = createAdminClient(),
    path = `lessons/${parsed.data.module_id}/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "-")}`,
    { error: uploadError } = await admin.storage
      .from("course-media")
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
      });
  if (uploadError)
    return Response.json({ error: uploadError.message }, { status: 400 });
  const url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl,
    { data: last } = await admin
      .from("lessons")
      .select("position")
      .eq("module_id", parsed.data.module_id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle(),
    { data, error } = await admin
      .from("lessons")
      .insert({
        ...parsed.data,
        content_url: url,
        position: (last?.position || 0) + 1,
      })
      .select("id,title,content_type,content_url,description,position")
      .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
