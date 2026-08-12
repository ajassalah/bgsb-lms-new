import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
const LIMIT = 100 * 1024 * 1024;
export async function POST(request: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient(),
    type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    const parsed = z
      .object({
        name: z.string().trim().min(1).max(100),
        parent_id: z.string().uuid().nullable().optional(),
      })
      .safeParse(await request.json());
    if (!parsed.success)
      return Response.json({ error: "Enter a folder name" }, { status: 400 });
    const { data, error } = await admin
      .from("private_files")
      .insert({
        user_id: user.id,
        parent_id: parsed.data.parent_id || null,
        name: parsed.data.name,
        item_type: "folder",
      })
      .select("*")
      .single();
    return error
      ? Response.json({ error: error.message }, { status: 400 })
      : Response.json({ ...data, url: null });
  }
  const form = await request.formData(),
    file = form.get("file"),
    parent = String(form.get("parent_id") || "") || null;
  if (!(file instanceof File) || !file.size)
    return Response.json({ error: "Choose a file" }, { status: 400 });
  if (file.size > LIMIT)
    return Response.json(
      { error: "A file cannot exceed 100 MB" },
      { status: 400 },
    );
  const { data: existing } = await admin
      .from("private_files")
      .select("size_bytes")
      .eq("user_id", user.id)
      .eq("item_type", "file"),
    used = (existing || []).reduce(
      (sum, row) => sum + Number(row.size_bytes || 0),
      0,
    );
  if (used + file.size > LIMIT)
    return Response.json(
      {
        error: `Storage limit exceeded. ${Math.max(0, Math.floor((LIMIT - used) / 1024 / 1024))} MB remaining`,
      },
      { status: 400 },
    );
  const safe = file.name.replace(/[^a-z0-9._-]/gi, "-"),
    path = `private-files/${user.id}/${Date.now()}-${safe}`,
    upload = await admin.storage.from("course-media").upload(path, file, {
      contentType: file.type || "application/octet-stream",
    });
  if (upload.error)
    return Response.json({ error: upload.error.message }, { status: 400 });
  const { data, error } = await admin
    .from("private_files")
    .insert({
      user_id: user.id,
      parent_id: parent,
      name: file.name,
      item_type: "file",
      storage_path: path,
      mime_type: file.type || null,
      size_bytes: file.size,
    })
    .select("*")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({
        ...data,
        url: admin.storage.from("course-media").getPublicUrl(path).data
          .publicUrl,
      });
}
