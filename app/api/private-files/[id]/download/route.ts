import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function owner() {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  return user;
}

function fileName(name: string) {
  return name.replace(/[\\/:*?"<>|]+/g, "-").trim() || "private-file";
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await owner();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: item, error } = await admin
    .from("private_files")
    .select("name,item_type,mime_type,storage_path")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  if (!item) return Response.json({ error: "File not found" }, { status: 404 });
  if (item.item_type !== "file" || !item.storage_path) {
    return Response.json(
      { error: "Only files can be downloaded" },
      { status: 400 },
    );
  }

  const { data: file, error: downloadError } = await admin.storage
    .from("course-media")
    .download(item.storage_path);

  if (downloadError || !file) {
    return Response.json(
      { error: downloadError?.message || "File could not be downloaded" },
      { status: 400 },
    );
  }

  return new Response(await file.arrayBuffer(), {
    headers: {
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName(item.name))}`,
      "Content-Type": item.mime_type || "application/octet-stream",
    },
  });
}
