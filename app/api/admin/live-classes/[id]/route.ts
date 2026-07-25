import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
async function auth() {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return false;
  const { data: p } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return p?.role === "super_admin";
}
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await auth()))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData(),
    instructorIds = form.getAll("instructor_ids").map(String),
    courseIds = form.getAll("course_ids").map(String),
    studentIds = form.getAll("student_ids").map(String),
    staffIds = form.getAll("staff_ids").map(String);
  const parsed = z
    .object({
      title: z.string().trim().min(2),
      description: z.string().trim().min(2),
      meeting_url: z.string().url(),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return Response.json({ error: "Invalid details" }, { status: 400 });
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
  const admin = createAdminClient(),
    file = form.get("thumbnail"),
    changes: Record<string, unknown> = {
      ...parsed.data,
      course_id: courseIds[0],
      instructor_id: instructorIds[0],
    };
  const [{ data: courseRows }, { data: enrollmentRows }, { data: staffRows }] =
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
  if (file instanceof File && file.size) {
    const ext =
        file.name
          .split(".")
          .pop()
          ?.replace(/[^a-z0-9]/gi, "") || "jpg",
      path = `live-classes/${params.id}-${Date.now()}.${ext}`,
      { error: uploadError } = await admin.storage
        .from("course-media")
        .upload(path, file, { contentType: file.type });
    if (uploadError)
      return Response.json({ error: uploadError.message }, { status: 400 });
    changes.thumbnail_url = admin.storage
      .from("course-media")
      .getPublicUrl(path).data.publicUrl;
  }
  const { data, error } = await admin
    .from("live_sessions")
    .update(changes)
    .eq("id", params.id)
    .select("id,title,description,meeting_url,thumbnail_url")
    .single();
  if (!error) {
    const deletes = await Promise.all([
      admin
        .from("live_session_instructors")
        .delete()
        .eq("session_id", params.id),
      admin.from("live_session_courses").delete().eq("session_id", params.id),
      admin.from("live_session_students").delete().eq("session_id", params.id),
      admin.from("live_session_staff").delete().eq("session_id", params.id),
    ]);
    const deleteError = deletes.find((result) => result.error)?.error;
    if (deleteError)
      return Response.json({ error: deleteError.message }, { status: 400 });
    const inserts = await Promise.all([
      admin.from("live_session_instructors").insert(
        instructorIds.map((instructor_id) => ({
          session_id: params.id,
          instructor_id,
        })),
      ),
      admin.from("live_session_courses").insert(
        courseIds.map((course_id) => ({
          session_id: params.id,
          course_id,
        })),
      ),
      studentIds.length
        ? admin.from("live_session_students").insert(
            studentIds.map((student_id) => ({
              session_id: params.id,
              student_id,
            })),
          )
        : Promise.resolve({ error: null }),
      staffIds.length
        ? admin.from("live_session_staff").insert(
            staffIds.map((staff_id) => ({
              session_id: params.id,
              staff_id,
            })),
          )
        : Promise.resolve({ error: null }),
    ]);
    const assignmentError = inserts.find((result) => result.error)?.error;
    if (assignmentError)
      return Response.json({ error: assignmentError.message }, { status: 400 });
  }
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  if (!(await auth()))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("live_sessions")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
