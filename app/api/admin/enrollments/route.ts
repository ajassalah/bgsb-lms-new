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
    .object({
      student_id: z.string().uuid().optional(),
      student_ids: z.array(z.string().uuid()).min(1).optional(),
      course_id: z.string().uuid(),
      batch_id: z
        .union([z.string().uuid(), z.literal("")])
        .nullable()
        .optional(),
    })
    .safeParse(await req.json());
  if (!parsed.success || (!parsed.data.student_id && !parsed.data.student_ids?.length))
    return Response.json(
      { error: "Select a student and course" },
      { status: 400 },
    );
  const studentIds = parsed.data.student_ids || [parsed.data.student_id!];
  const [{ data: students }, { data: course }] = await Promise.all([
    admin
      .from("profiles")
      .select("id,full_name,email,organization_id")
      .in("id", studentIds),
    admin
      .from("courses")
      .select("title")
      .eq("id", parsed.data.course_id)
      .single(),
  ]);
  const { data, error } = await admin
    .from("enrollments")
    .insert(
      studentIds.map((student_id) => ({
        student_id,
        course_id: parsed.data.course_id,
        batch_id: parsed.data.batch_id || null,
        organization_id: students?.find((student) => student.id === student_id)?.organization_id || null,
        enrolled_via: "manual",
        status: "pending",
      })),
    )
    .select("id,student_id,status,enrolled_at")
    ;
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
  if (parsed.data.batch_id)
    await admin
      .from("batch_learners")
      .upsert(studentIds.map((student_id) => ({ batch_id: parsed.data.batch_id, student_id })));
  return Response.json((data || []).map((item) => {
    const student = students?.find((profile) => profile.id === item.student_id);
    return { id: item.id, studentId: item.student_id, student: student?.full_name || "Student", studentEmail: student?.email || "", courseId: parsed.data.course_id, course: course?.title || "Course", date: item.enrolled_at, status: item.status, batchId: parsed.data.batch_id || "" };
  }));
}
