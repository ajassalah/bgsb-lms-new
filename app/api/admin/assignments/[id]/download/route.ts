import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { staffCan } from "@/lib/staff-permissions";

function fileName(title: string, url: string) {
  const extension = url.split("?")[0].match(/\.([a-z0-9]{1,10})$/i)?.[1];
  const safe = title.replace(/[^a-z0-9 _-]/gi, "").trim() || "assignment";
  return extension ? `${safe}.${extension}` : safe;
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const allowed =
    (await staffCan(user.id, "curriculum_overview", "view")) ||
    (await staffCan(user.id, "curriculum_assignments", "create")) ||
    (await staffCan(user.id, "curriculum_assignments", "edit"));
  if (!allowed) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { data: assignment } = await createAdminClient()
    .from("assignments")
    .select("title,file_url")
    .eq("id", params.id)
    .maybeSingle();
  if (!assignment?.file_url)
    return Response.json(
      { error: "Assignment file not found" },
      { status: 404 },
    );
  try {
    const source = await fetch(assignment.file_url, { cache: "no-store" });
    if (!source.ok || !source.body)
      return Response.json(
        { error: "Assignment source is unavailable" },
        { status: 502 },
      );
    return new Response(source.body, {
      headers: {
        "Content-Type":
          source.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName(assignment.title, assignment.file_url))}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "Assignment source could not be reached" },
      { status: 502 },
    );
  }
}
