import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";

async function actor(action: string) {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  return user && (await adminActorCan(user.id, "class_management", action))
    ? user
    : null;
}

export async function GET() {
  if (!(await actor("access")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const db = createAdminClient();
  const [
    courses,
    batches,
    liveSessions,
    instructors,
    staff,
    links,
    classes,
    classCourses,
    classBatches,
    classInstructors,
    classStaff,
  ] = await Promise.all([
    db.from("courses").select("id,title").order("title"),
    db
      .from("batches")
      .select("id,batch_name,course_id,status")
      .order("batch_name"),
    db
      .from("live_sessions")
      .select(
        "id,title,meeting_url,scheduled_start,scheduled_end,status,course_id,live_session_courses(course_id)",
      )
      .in("status", ["scheduled", "live"])
      .gte("scheduled_end", new Date().toISOString())
      .order("scheduled_start", { ascending: true }),
    db
      .from("profiles")
      .select("id,full_name,email,avatar_url")
      .eq("role", "instructor")
      .order("full_name"),
    db
      .from("profiles")
      .select("id,full_name,email,avatar_url")
      .eq("role", "admin_staff")
      .order("full_name"),
    db.from("course_instructors").select("course_id,instructor_id"),
    db
      .from("generated_classes")
      .select("id,subject,scheduled_at,live_session_id,created_at")
      .order("created_at", { ascending: false }),
    db.from("generated_class_courses").select("class_id,course_id"),
    db.from("generated_class_batches").select("class_id,batch_id"),
    db.from("generated_class_instructors").select("class_id,instructor_id"),
    db.from("generated_class_staff").select("class_id,staff_id"),
  ]);
  const error = [
    courses,
    batches,
    liveSessions,
    instructors,
    staff,
    links,
    classes,
    classCourses,
    classBatches,
    classInstructors,
    classStaff,
  ].find((x) => x.error)?.error;
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({
    courses: courses.data || [],
    batches: batches.data || [],
    liveSessions: liveSessions.data || [],
    instructors: instructors.data || [],
    staff: staff.data || [],
    courseInstructors: links.data || [],
    classes: (classes.data || []).map((item) => ({
      ...item,
      courseIds: (classCourses.data || [])
        .filter((x) => x.class_id === item.id)
        .map((x) => x.course_id),
      batchIds: (classBatches.data || [])
        .filter((x) => x.class_id === item.id)
        .map((x) => x.batch_id),
      instructorIds: (classInstructors.data || [])
        .filter((x) => x.class_id === item.id)
        .map((x) => x.instructor_id),
      staffIds: (classStaff.data || [])
        .filter((x) => x.class_id === item.id)
        .map((x) => x.staff_id),
    })),
  });
}

const schema = z.object({
  subject: z.string().trim().min(1),
  courseIds: z.array(z.string().uuid()).min(1),
  batchIds: z.array(z.string().uuid()).min(1),
  instructorIds: z.array(z.string().uuid()).min(1),
  staffIds: z.array(z.string().uuid()).default([]),
  liveSessionId: z.string().uuid(),
});

export async function POST(request: Request) {
  const user = await actor("access");
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return Response.json(
      { error: "Select courses, batches, instructors and enter a subject." },
      { status: 400 },
    );
  const db = createAdminClient(),
    value = parsed.data;
  const { data: liveSession } = await db
    .from("live_sessions")
    .select("scheduled_start")
    .eq("id", value.liveSessionId)
    .maybeSingle();
  if (!liveSession)
    return Response.json(
      { error: "Select a valid scheduled live class link." },
      { status: 400 },
    );
  const { data: item, error } = await db
    .from("generated_classes")
    .insert({
      subject: value.subject,
      created_by: user.id,
      scheduled_at: liveSession.scheduled_start,
      live_session_id: value.liveSessionId,
    })
    .select("id")
    .single();
  if (error || !item)
    return Response.json(
      { error: error?.message || "Class could not be created" },
      { status: 400 },
    );
  const writes = [
    db
      .from("generated_class_courses")
      .insert(
        value.courseIds.map((course_id) => ({ class_id: item.id, course_id })),
      ),
    db
      .from("generated_class_batches")
      .insert(
        value.batchIds.map((batch_id) => ({ class_id: item.id, batch_id })),
      ),
    db.from("generated_class_instructors").insert(
      value.instructorIds.map((instructor_id) => ({
        class_id: item.id,
        instructor_id,
      })),
    ),
    value.staffIds.length
      ? db
          .from("generated_class_staff")
          .insert(
            value.staffIds.map((staff_id) => ({ class_id: item.id, staff_id })),
          )
      : Promise.resolve({ error: null }),
  ];
  const results = await Promise.all(writes);
  const writeError = results.find((x) => x.error)?.error;
  if (writeError) {
    await db.from("generated_classes").delete().eq("id", item.id);
    return Response.json({ error: writeError.message }, { status: 400 });
  }
  return Response.json({ ok: true, id: item.id });
}
