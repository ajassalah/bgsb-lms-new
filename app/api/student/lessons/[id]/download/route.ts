import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function fileName(title: string, url: string) {
  const cleanUrl = url.split("?")[0],
    extension = cleanUrl.match(/\.([a-z0-9]{1,10})$/i)?.[1],
    safeTitle = title.replace(/[^a-z0-9 _-]/gi, "").trim() || "course-document";
  return extension ? `${safeTitle}.${extension}` : safeTitle;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient(),
    { data: lesson } = await admin
      .from("lessons")
      .select("title,content_type,content_url,module:course_modules(course_id)")
      .eq("id", params.id)
      .maybeSingle();
  const courseId = (lesson?.module as unknown as { course_id: string } | null)
    ?.course_id;
  if (
    !lesson ||
    lesson.content_type !== "document" ||
    !lesson.content_url ||
    !courseId
  )
    return Response.json({ error: "Document not found" }, { status: 404 });
  const { data: enrollment } = await admin
    .from("enrollments")
    .select("id")
    .eq("student_id", user.id)
    .eq("course_id", courseId)
    .in("status", ["approved", "completed"])
    .maybeSingle();
  if (!enrollment)
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const source = await fetch(lesson.content_url);
  if (!source.ok || !source.body)
    return Response.json(
      { error: "Document could not be downloaded" },
      { status: 502 },
    );
  return new Response(source.body, {
    headers: {
      "Content-Type":
        source.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileName(lesson.title, lesson.content_url)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
