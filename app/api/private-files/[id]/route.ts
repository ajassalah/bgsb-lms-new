import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
async function owner() {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  return user;
}
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await owner();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = z
    .object({
      name: z.string().trim().min(1).max(150),
      parent_id: z.string().uuid().nullable().optional(),
    })
    .safeParse(await request.json());
  if (!parsed.success)
    return Response.json({ error: "Enter a valid name" }, { status: 400 });
  const admin = createAdminClient();
  if (parsed.data.parent_id === params.id)
    return Response.json(
      { error: "An item cannot be moved inside itself" },
      { status: 400 },
    );
  if (parsed.data.parent_id) {
    const { data: parent } = await admin
      .from("private_files")
      .select("id")
      .eq("id", parsed.data.parent_id)
      .eq("user_id", user.id)
      .eq("item_type", "folder")
      .maybeSingle();
    if (!parent)
      return Response.json(
        { error: "Destination folder not found" },
        { status: 400 },
      );
  }
  const changes: Record<string, unknown> = {
    name: parsed.data.name,
    updated_at: new Date().toISOString(),
  };
  if (parsed.data.parent_id !== undefined)
    changes.parent_id = parsed.data.parent_id;
  const { data, error } = await admin
    .from("private_files")
    .update(changes)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  if (!data) return Response.json({ error: "Item not found" }, { status: 404 });
  return Response.json({
    ...data,
    url: data.storage_path
      ? admin.storage.from("course-media").getPublicUrl(data.storage_path).data
          .publicUrl
      : null,
  });
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const user = await owner();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient(),
    { data: all } = await admin
      .from("private_files")
      .select("id,parent_id,storage_path")
      .eq("user_id", user.id);
  const target = (all || []).find((x) => x.id === params.id);
  if (!target)
    return Response.json({ error: "Item not found" }, { status: 404 });
  const ids = new Set([params.id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const item of all || [])
      if (item.parent_id && ids.has(item.parent_id) && !ids.has(item.id)) {
        ids.add(item.id);
        changed = true;
      }
  }
  const paths = (all || [])
    .filter((x) => ids.has(x.id) && x.storage_path)
    .map((x) => x.storage_path as string);
  if (paths.length) {
    const { error } = await admin.storage.from("course-media").remove(paths);
    if (error) return Response.json({ error: error.message }, { status: 400 });
  }
  const { error } = await admin
    .from("private_files")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true, ids: Array.from(ids) });
}
