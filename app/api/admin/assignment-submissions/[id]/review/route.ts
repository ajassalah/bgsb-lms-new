import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient(),
    { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
  if (
    !["super_admin", "admin_staff", "instructor"].includes(profile?.role || "")
  )
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .object({
      grade: z.enum(["distinction", "pass", "credit_pass", "fail"]),
      review_status: z.enum(["submitted", "accepted", "declined", "resubmit"]),
      feedback: z.string().optional(),
    })
    .safeParse(await request.json());
  if (!parsed.success)
    return Response.json(
      { error: "Select a valid grade and status" },
      { status: 400 },
    );
  const { data, error } = await admin
    .from("assignment_submissions")
    .update({
      ...parsed.data,
      score: null,
      graded_by: user.id,
      graded_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select(
      "id,student_id,grade,review_status,assignment:assignments!assignment_submissions_assignment_id_fkey(id,title,course_id,course:courses(title))",
    )
    .single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const assignment = Array.isArray((data as any).assignment)
    ? (data as any).assignment[0]
    : (data as any).assignment;
  const course = Array.isArray(assignment?.course)
    ? assignment.course[0]
    : assignment?.course;
  const labels: Record<string, string> = {
    submitted: "submitted",
    accepted: "accepted",
    declined: "declined",
    resubmit: "requires resubmission",
  };
  await admin.from("user_notifications").insert({
    user_id: (data as any).student_id,
    title: `Assignment review: “${assignment?.title || "Assignment"}” in ${course?.title || "your course"} is ${labels[data.review_status]}. Grade: ${String(data.grade).replace("_", " ")}.`,
    url: `/dashboard/student/assignments/${assignment?.course_id}/${assignment?.id}`,
  });
  return Response.json(data);
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient(),
    [{ data: profile }, { data: submission }] = await Promise.all([
      admin.from("profiles").select("role").eq("id", user.id).maybeSingle(),
      admin
        .from("assignment_submissions")
        .select(
          "id,assignment:assignments!assignment_submissions_assignment_id_fkey(course_id)",
        )
        .eq("id", params.id)
        .maybeSingle(),
    ]);
  if (
    !submission ||
    !["super_admin", "admin_staff", "instructor"].includes(profile?.role || "")
  )
    return Response.json({ error: "Forbidden" }, { status: 403 });
  if (profile?.role === "instructor") {
    const courseId = (submission as any).assignment?.course_id,
      { data: access } = await admin
        .from("course_instructors")
        .select("course_id")
        .eq("course_id", courseId)
        .eq("instructor_id", user.id)
        .maybeSingle();
    if (!access)
      return Response.json(
        { error: "You are not assigned to this course" },
        { status: 403 },
      );
  }
  const { error } = await admin
    .from("assignment_submissions")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
