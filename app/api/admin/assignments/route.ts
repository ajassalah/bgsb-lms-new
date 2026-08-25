import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { adminActorCan } from "@/lib/staff-permissions";

export async function POST(req: Request) {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await db
    .from("profiles")
    .select("role,full_name")
    .eq("id", user.id)
    .single();
  if (
    !["super_admin", "admin_staff", "instructor"].includes(profile?.role || "")
  )
    return Response.json({ error: "Forbidden" }, { status: 403 });
  if (
    profile?.role === "admin_staff" &&
    !(await adminActorCan(user.id, "curriculum_assignments", "create"))
  )
    return Response.json({ error: "Forbidden" }, { status: 403 });

  const form = await req.formData();
  const parsed = z
    .object({
      course_id: z.string().uuid(),
      module_id: z.string().uuid(),
      instructor_id: z.string().uuid(),
      title: z.string().trim().min(2),
      description: z.string().trim().min(2),
      due_date: z.string().min(1),
      pass_marks: z.coerce.number().min(0),
      max_score: z.coerce.number().positive(),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return Response.json({ error: "Invalid assignment" }, { status: 400 });

  const admin = createAdminClient();
  if (profile?.role === "instructor") {
    const { data: access } = await admin
      .from("course_instructors")
      .select("course_id")
      .eq("course_id", parsed.data.course_id)
      .eq("instructor_id", user.id)
      .maybeSingle();
    if (!access)
      return Response.json(
        { error: "You are not assigned to this course" },
        { status: 403 },
      );
  }
  const file = form.get("file");
  let file_url: string | null = null;
  if (file instanceof File && file.size) {
    const path = `assignments/${parsed.data.module_id}/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "-")}`;
    const { error } = await admin.storage
      .from("course-media")
      .upload(path, file, {
        contentType: file.type || "application/octet-stream",
      });
    if (error) return Response.json({ error: error.message }, { status: 400 });
    file_url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl;
  }

  const { data, error } = await admin
    .from("assignments")
    .insert({ ...parsed.data, file_url })
    .select("id,title,pass_marks,max_score,due_date")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 400 });

  const [{ data: enrollments }, { data: courseInstructors }, { data: course }] =
    await Promise.all([
      admin
        .from("enrollments")
        .select("student_id")
        .eq("course_id", parsed.data.course_id)
        .in("status", ["approved", "completed"]),
      admin
        .from("course_instructors")
        .select("instructor_id")
        .eq("course_id", parsed.data.course_id),
      admin
        .from("courses")
        .select("title")
        .eq("id", parsed.data.course_id)
        .maybeSingle(),
    ]);
  const students = Array.from(
      new Set((enrollments || []).map((row) => row.student_id)),
    ),
    instructors = Array.from(
      new Set([
        parsed.data.instructor_id,
        ...(courseInstructors || []).map((row) => row.instructor_id),
      ]),
    );
  const notifications = [
    ...students.map((user_id) => ({
      user_id,
      title: `New assignment in ${course?.title || "your course"}: ${data.title}. Open it to view the instructions and deadline.`,
      url: `/dashboard/student/assignments/${parsed.data.course_id}/${data.id}`,
    })),
    ...instructors.map((user_id) => ({
      user_id,
      title: `${profile?.full_name || "A staff member"} added assignment “${data.title}” to ${course?.title || "an assigned course"}.`,
      url: `/dashboard/instructor/assignments/${parsed.data.course_id}`,
    })),
  ];
  if (notifications.length)
    await admin.from("user_notifications").insert(notifications);

  return Response.json(data);
}
