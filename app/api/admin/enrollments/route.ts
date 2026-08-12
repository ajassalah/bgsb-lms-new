import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { adminActorCan } from "@/lib/staff-permissions";
import { createAdminClient } from "@/lib/supabase/admin";
export async function POST(req: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await adminActorCan(user.id, "enrollment", "create")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const admin = createAdminClient();
  const parsed = z
    .object({ student_id: z.string().uuid(), course_id: z.string().uuid() })
    .safeParse(await req.json());
  if (!parsed.success)
    return Response.json(
      { error: "Select a student and course" },
      { status: 400 },
    );
  const [{ data: student }, { data: course }] = await Promise.all([
    admin
      .from("profiles")
      .select("full_name,email,organization_id")
      .eq("id", parsed.data.student_id)
      .single(),
    admin
      .from("courses")
      .select("title")
      .eq("id", parsed.data.course_id)
      .single(),
  ]);
  const { data, error } = await admin
    .from("enrollments")
    .insert({
      student_id: parsed.data.student_id,
      course_id: parsed.data.course_id,
      organization_id: student?.organization_id || null,
      enrolled_via: "manual",
      status: "pending",
    })
    .select("id,status,enrolled_at")
    .single();
  if (error)
    return Response.json(
      {
        error:
          error.code === "23505"
            ? "Student is already enrolled in this course"
            : error.message,
      },
      { status: 400 },
    );
  return Response.json({
    id: data.id,
    studentId: parsed.data.student_id,
    student: student?.full_name || "Student",
    studentEmail: student?.email || "",
    courseId: parsed.data.course_id,
    course: course?.title || "Course",
    date: data.enrolled_at,
    status: data.status,
  });
}
