import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export async function POST(request: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient(),
    { data: actor } = await admin
      .from("profiles")
      .select("role,full_name")
      .eq("id", user.id)
      .maybeSingle();
  if (!["super_admin", "admin_staff", "instructor"].includes(actor?.role || ""))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await request.formData(),
    assignmentId = String(form.get("assignment_id") || ""),
    studentId = String(form.get("student_id") || ""),
    description = String(form.get("description") || "").trim(),
    { data: assignment } = await admin
      .from("assignments")
      .select("id,title,course_id,course:courses(title)")
      .eq("id", assignmentId)
      .maybeSingle();
  if (!assignment)
    return Response.json({ error: "Assignment not found" }, { status: 404 });
  if (actor?.role === "instructor") {
    const { data: access } = await admin
      .from("course_instructors")
      .select("course_id")
      .eq("course_id", assignment.course_id)
      .eq("instructor_id", user.id)
      .maybeSingle();
    if (!access)
      return Response.json(
        { error: "You are not assigned to this course" },
        { status: 403 },
      );
  }
  const { data: enrollment } = await admin
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("course_id", assignment.course_id)
    .in("status", ["approved", "completed"])
    .maybeSingle();
  if (!enrollment)
    return Response.json(
      { error: "Student is not enrolled in this course" },
      { status: 400 },
    );
  const file = form.get("file");
  let file_url: string | null = null;
  if (file instanceof File && file.size) {
    const ext =
        file.name
          .split(".")
          .pop()
          ?.replace(/[^a-z0-9]/gi, "") || "bin",
      path = `assignment-submissions/${studentId}/${assignmentId}-${Date.now()}.${ext}`,
      upload = await admin.storage.from("course-media").upload(path, file, {
        contentType: file.type || "application/octet-stream",
      });
    if (upload.error)
      return Response.json({ error: upload.error.message }, { status: 400 });
    file_url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl;
  } else {
    const { data: existing } = await admin
      .from("assignment_submissions")
      .select("file_url")
      .eq("assignment_id", assignmentId)
      .eq("student_id", studentId)
      .maybeSingle();
    file_url = existing?.file_url || null;
  }
  if (!file_url)
    return Response.json(
      { error: "Upload an attachment file" },
      { status: 400 },
    );
  const { data, error } = await admin
    .from("assignment_submissions")
    .upsert(
      {
        assignment_id: assignmentId,
        student_id: studentId,
        file_url,
        description,
        submitted_at: new Date().toISOString(),
        review_status: "submitted",
      },
      { onConflict: "assignment_id,student_id" },
    )
    .select("id,file_url,submitted_at,review_status")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const course = Array.isArray((assignment as any).course)
    ? (assignment as any).course[0]
    : (assignment as any).course;
  const [{ data: instructors }, { data: student }] = await Promise.all([
    admin
      .from("course_instructors")
      .select("instructor_id")
      .eq("course_id", assignment.course_id),
    admin
      .from("profiles")
      .select("full_name")
      .eq("id", studentId)
      .maybeSingle(),
  ]);
  const notifications = [
    {
      user_id: studentId,
      title: `${actor?.full_name || "A staff member"} uploaded “${assignment.title}” for you in ${course?.title || "your course"}.`,
      url: `/dashboard/student/assignments/${assignment.course_id}/${assignment.id}`,
    },
    ...(instructors || [])
      .filter((row) => row.instructor_id !== user.id)
      .map((row) => ({
        user_id: row.instructor_id,
        title: `${actor?.full_name || "A staff member"} uploaded ${student?.full_name || "a student"}’s submission for “${assignment.title}” in ${course?.title || "your course"}.`,
        url: `/dashboard/instructor/assignments/${assignment.course_id}`,
      })),
  ];
  if (notifications.length)
    await admin.from("user_notifications").insert(notifications);
  return Response.json(data);
}
