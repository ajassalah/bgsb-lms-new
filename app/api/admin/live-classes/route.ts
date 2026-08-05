import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { revalidatePath } from "next/cache";
async function auth() {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return null;
  const { data: p } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return p?.role === "super_admin" ? user : null;
}
export async function POST(req: Request) {
  const user = await auth();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData(),
    instructorIds = form.getAll("instructor_ids").map(String),
    courseIds = form.getAll("course_ids").map(String),
    studentIds = form.getAll("student_ids").map(String),
    staffIds = form.getAll("staff_ids").map(String),
    parsed = z
      .object({
        title: z.string().trim().min(2),
        description: z.string().trim().min(2),
        meeting_url: z.string().url(),
        scheduled_start: z.string().min(1),
        scheduled_end: z.string().min(1),
      })
      .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return Response.json(
      { error: "Enter valid live class details" },
      { status: 400 },
    );
  const scheduledStart = new Date(parsed.data.scheduled_start),
    scheduledEnd = new Date(parsed.data.scheduled_end);
  if (
    Number.isNaN(scheduledStart.getTime()) ||
    Number.isNaN(scheduledEnd.getTime()) ||
    scheduledEnd <= scheduledStart
  )
    return Response.json(
      { error: "Scheduled end must be after the start time" },
      { status: 400 },
    );
  if (!instructorIds.length)
    return Response.json(
      { error: "Select at least one instructor" },
      { status: 400 },
    );
  if (!courseIds.length)
    return Response.json(
      { error: "Select at least one course" },
      { status: 400 },
    );
  const file = form.get("thumbnail");
  if (!(file instanceof File) || !file.size)
    return Response.json({ error: "Select a thumbnail" }, { status: 400 });
  const admin = createAdminClient(),
    [{ data: courseRows }, { data: enrollmentRows }, { data: staffRows }] =
      await Promise.all([
        admin.from("courses").select("id,instructor_id").in("id", courseIds),
        admin
          .from("enrollments")
          .select("student_id")
          .in("course_id", courseIds)
          .eq("status", "active"),
        staffIds.length
          ? admin
              .from("profiles")
              .select("id")
              .in("id", staffIds)
              .eq("role", "admin_staff")
              .eq("status", "active")
          : Promise.resolve({ data: [], error: null }),
      ]),
    eligibleInstructors = new Set(
      (courseRows || []).map((course) => course.instructor_id).filter(Boolean),
    ),
    eligibleStudents = new Set(
      (enrollmentRows || []).map((enrollment) => enrollment.student_id),
    ),
    eligibleStaff = new Set((staffRows || []).map((member) => member.id));
  if (instructorIds.some((id) => !eligibleInstructors.has(id)))
    return Response.json(
      { error: "Select instructors assigned to the selected courses" },
      { status: 400 },
    );
  if (studentIds.some((id) => !eligibleStudents.has(id)))
    return Response.json(
      { error: "Select students enrolled in the selected courses" },
      { status: 400 },
    );
  if (staffIds.some((id) => !eligibleStaff.has(id)))
    return Response.json(
      { error: "Select active staff members" },
      { status: 400 },
    );
  const ext =
      file.name
        .split(".")
        .pop()
        ?.replace(/[^a-z0-9]/gi, "") || "jpg",
    path = `live-classes/${Date.now()}.${ext}`,
    { error: uploadError } = await admin.storage
      .from("course-media")
      .upload(path, file, { contentType: file.type });
  if (uploadError)
    return Response.json({ error: uploadError.message }, { status: 400 });
  const thumbnail_url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl,
    { data, error } = await admin
      .from("live_sessions")
      .insert({
        title: parsed.data.title,
        description: parsed.data.description,
        meeting_url: parsed.data.meeting_url,
        thumbnail_url,
        course_id: courseIds[0],
        instructor_id: instructorIds[0],
        scheduled_start: scheduledStart.toISOString(),
        scheduled_end: scheduledEnd.toISOString(),
        status: "scheduled",
      })
      .select(
        "id,title,description,meeting_url,thumbnail_url,scheduled_start,scheduled_end",
      )
      .single();
  if (!error && data) {
    const assignments = await Promise.all([
      admin.from("live_session_instructors").insert(
        instructorIds.map((instructor_id) => ({
          session_id: data.id,
          instructor_id,
        })),
      ),
      admin.from("live_session_courses").insert(
        courseIds.map((course_id) => ({
          session_id: data.id,
          course_id,
        })),
      ),
      studentIds.length
        ? admin.from("live_session_students").insert(
            studentIds.map((student_id) => ({
              session_id: data.id,
              student_id,
            })),
          )
        : Promise.resolve({ error: null }),
      staffIds.length
        ? admin.from("live_session_staff").insert(
            staffIds.map((staff_id) => ({
              session_id: data.id,
              staff_id,
            })),
          )
        : Promise.resolve({ error: null }),
    ]);
    const assignmentError = assignments.find((result) => result.error)?.error;
    if (assignmentError)
      return Response.json({ error: assignmentError.message }, { status: 400 });
  }
  if (error) return Response.json({ error: error.message }, { status: 400 });
  revalidatePath("/dashboard/super-admin");
  revalidatePath("/dashboard/super-admin/calendar");
  return Response.json(data);
}
