import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export async function POST(
  request: Request,
  { params }: { params: { assignmentId: string } },
) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient(),
    { data: assignment } = await admin
      .from("assignments")
      .select("id,course_id")
      .eq("id", params.assignmentId)
      .maybeSingle();
  if (!assignment)
    return Response.json({ error: "Assignment not found" }, { status: 404 });
  const { data: enrollment } = await admin
    .from("enrollments")
    .select("id")
    .eq("student_id", user.id)
    .eq("course_id", assignment.course_id)
    .in("status", ["approved", "completed"])
    .maybeSingle();
  if (!enrollment)
    return Response.json(
      { error: "You are not enrolled in this course" },
      { status: 403 },
    );
  const { data: existing } = await admin
    .from("assignment_submissions")
    .select("file_url,review_status")
    .eq("assignment_id", params.assignmentId)
    .eq("student_id", user.id)
    .maybeSingle();
  if (existing?.review_status === "accepted")
    return Response.json(
      { error: "Accepted assignments cannot be changed" },
      { status: 403 },
    );
  const form = await request.formData(),
    file = form.get("file"),
    description = String(form.get("description") || "").trim();
  let file_url: string | null = null;
  if (file instanceof File && file.size) {
    const ext =
        file.name
          .split(".")
          .pop()
          ?.replace(/[^a-z0-9]/gi, "") || "bin",
      path = `assignment-submissions/${user.id}/${params.assignmentId}-${Date.now()}.${ext}`,
      upload = await admin.storage.from("course-media").upload(path, file, {
        contentType: file.type || "application/octet-stream",
      });
    if (upload.error)
      return Response.json({ error: upload.error.message }, { status: 400 });
    file_url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl;
  } else {
    file_url = existing?.file_url || null;
  }
  if (!file_url)
    return Response.json(
      { error: "Upload an assignment attachment" },
      { status: 400 },
    );
  const { data, error } = await admin
    .from("assignment_submissions")
    .upsert(
      {
        assignment_id: params.assignmentId,
        student_id: user.id,
        file_url,
        description,
        submitted_at: new Date().toISOString(),
        review_status: "submitted",
        score: null,
        feedback: null,
        graded_by: null,
        graded_at: null,
      },
      { onConflict: "assignment_id,student_id" },
    )
    .select("id,file_url,description,submitted_at,review_status")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}

export async function DELETE(
  _: Request,
  { params }: { params: { assignmentId: string } },
) {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("assignment_submissions")
    .select("review_status")
    .eq("assignment_id", params.assignmentId)
    .eq("student_id", user.id)
    .maybeSingle();
  if (existing?.review_status === "accepted")
    return Response.json(
      { error: "Accepted assignments cannot be deleted" },
      { status: 403 },
    );
  const { error } = await admin
    .from("assignment_submissions")
    .delete()
    .eq("assignment_id", params.assignmentId)
    .eq("student_id", user.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
