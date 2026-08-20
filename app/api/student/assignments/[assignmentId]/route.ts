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
      .select("id,course_id,title,instructor_id,due_date,course:courses(title)")
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
  if (
    assignment.due_date &&
    new Date(assignment.due_date).getTime() < Date.now() &&
    existing?.review_status !== "resubmit"
  )
    return Response.json(
      { error: "The assignment deadline has passed" },
      { status: 403 },
    );
  const form = await request.formData(),
    file = form.get("file"),
    description = String(form.get("description") || "").trim();
  const hasNewFile = file instanceof File && file.size > 0;
  if (existing?.review_status === "resubmit" && !hasNewFile)
    return Response.json(
      { error: "Upload a new attachment to resubmit this assignment" },
      { status: 400 },
    );
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
  if (error) return Response.json({ error: error.message }, { status: 400 });

  const { data: lastAttempt } = await admin
    .from("assignment_submission_attempts")
    .select("attempt_number")
    .eq("assignment_id", params.assignmentId)
    .eq("student_id", user.id)
    .order("attempt_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { error: attemptError } = await admin
    .from("assignment_submission_attempts")
    .insert({
      assignment_id: params.assignmentId,
      student_id: user.id,
      file_url,
      description,
      submitted_at: data.submitted_at,
      attempt_number: (lastAttempt?.attempt_number || 0) + 1,
    });
  if (attemptError)
    return Response.json(
      {
        error: `Submission saved, but attempt history failed: ${attemptError.message}`,
      },
      { status: 400 },
    );

  const [{ data: student }, { data: courseInstructors }, { data: staff }] =
    await Promise.all([
      admin.from("profiles").select("full_name").eq("id", user.id).single(),
      admin
        .from("course_instructors")
        .select("instructor_id")
        .eq("course_id", assignment.course_id),
      admin
        .from("profiles")
        .select("id,role")
        .in("role", ["super_admin", "admin_staff"])
        .eq("status", "active"),
    ]);
  const course = Array.isArray((assignment as any).course)
    ? (assignment as any).course[0]
    : (assignment as any).course;
  const instructorIds = new Set([
      assignment.instructor_id,
      ...(courseInstructors || []).map((row) => row.instructor_id),
    ]),
    recipients = [
      ...Array.from(instructorIds)
        .filter(Boolean)
        .map((user_id) => ({
          user_id,
          title: `${student?.full_name || "A student"} submitted “${assignment.title}” in ${course?.title || "an assigned course"}. Open the submission to review it.`,
          url: `/dashboard/instructor/assignments/${assignment.course_id}`,
        })),
      ...(staff || []).map((member) => ({
        user_id: member.id,
        title: `${student?.full_name || "A student"} submitted “${assignment.title}” in ${course?.title || "a course"}. Open the submission to review it.`,
        url:
          member.role === "super_admin"
            ? `/dashboard/super-admin/assignments/${assignment.course_id}`
            : `/dashboard/admin-staff/assignments/${assignment.course_id}`,
      })),
    ];
  if (recipients.length)
    await admin.from("user_notifications").insert(recipients);

  return Response.json(data);
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
