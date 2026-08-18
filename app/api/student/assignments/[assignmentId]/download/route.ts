import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function uploadedFileName(url: string) {
  const pathname = new URL(url).pathname;
  const storedName = decodeURIComponent(
    pathname.split("/").pop() || "assignment-file",
  );
  return storedName.replace(/^\d+-/, "") || "assignment-file";
}

export async function GET(
  _request: Request,
  { params }: { params: { assignmentId: string } },
) {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: assignment } = await admin
    .from("assignments")
    .select("course_id,file_url")
    .eq("id", params.assignmentId)
    .maybeSingle();
  if (!assignment?.file_url)
    return Response.json(
      { error: "Assignment file not found" },
      { status: 404 },
    );

  const { data: enrollment } = await admin
    .from("enrollments")
    .select("id")
    .eq("student_id", user.id)
    .eq("course_id", assignment.course_id)
    .in("status", ["approved", "completed"])
    .maybeSingle();
  if (!enrollment)
    return Response.json({ error: "Forbidden" }, { status: 403 });

  const source = await fetch(assignment.file_url);
  if (!source.ok || !source.body)
    return Response.json(
      { error: "Assignment file could not be downloaded" },
      { status: 502 },
    );

  const name = uploadedFileName(assignment.file_url);
  return new Response(source.body, {
    headers: {
      "Content-Type":
        source.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
