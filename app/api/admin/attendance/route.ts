import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";

async function actor(action: string) {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  return user && (await adminActorCan(user.id, "class_attendance", action))
    ? user
    : null;
}

export async function GET(request: Request) {
  if (!(await actor("access")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const url = new URL(request.url),
    classId = url.searchParams.get("classId"),
    batchId = url.searchParams.get("batchId"),
    date = url.searchParams.get("date");
  if (!classId || !batchId || !date)
    return Response.json(
      { error: "Class, batch and date are required" },
      { status: 400 },
    );
  const db = createAdminClient();
  const [
    { data: enrollments, error },
    { data: records },
    { data: generatedClass },
  ] = await Promise.all([
    db
      .from("enrollments")
      .select("student_id")
      .eq("batch_id", batchId)
      .in("status", ["approved", "completed"]),
    db
      .from("class_attendance")
      .select("student_id,status,login_at,logout_at")
      .eq("class_id", classId)
      .eq("batch_id", batchId)
      .eq("attendance_date", date),
    db
      .from("generated_classes")
      .select("live_session_id")
      .eq("id", classId)
      .maybeSingle(),
  ]);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const ids = Array.from(new Set((enrollments || []).map((x) => x.student_id)));
  const [{ data: profiles }, { data: sessionAttendance }] = await Promise.all([
    ids.length
      ? db
          .from("profiles")
          .select("id,full_name,email,avatar_url")
          .in("id", ids)
          .order("full_name")
      : Promise.resolve({ data: [] }),
    ids.length && generatedClass?.live_session_id
      ? db
          .from("session_attendance")
          .select("student_id,joined_at,left_at")
          .eq("session_id", generatedClass.live_session_id)
          .in("student_id", ids)
          .order("joined_at", { ascending: true })
      : Promise.resolve({ data: [] }),
  ]);
  return Response.json({
    locked: (records || []).length > 0,
    students: (profiles || []).map((profile) => {
      const visits = (sessionAttendance || []).filter(
        (item) => item.student_id === profile.id,
      );
      const saved = (records || []).find(
        (item) => item.student_id === profile.id,
      );
      return {
        ...profile,
        attendance: {
          ...saved,
          login_at: visits[0]?.joined_at || saved?.login_at || null,
          logout_at:
            [...visits].reverse().find((item) => item.left_at)?.left_at ||
            saved?.logout_at ||
            null,
        },
      };
    }),
  });
}

const schema = z.object({
  classId: z.string().uuid(),
  batchId: z.string().uuid(),
  date: z.string().min(10),
  rows: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.enum(["present", "absent", "late"]),
    }),
  ),
});

export async function POST(request: Request) {
  const user = await actor("access");
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return Response.json(
      { error: "Invalid attendance register" },
      { status: 400 },
    );
  const value = parsed.data,
    now = new Date().toISOString(),
    admin = createAdminClient();
  const { count: existing } = await admin
    .from("class_attendance")
    .select("id", { count: "exact", head: true })
    .eq("class_id", value.classId)
    .eq("batch_id", value.batchId)
    .eq("attendance_date", value.date);
  if (existing)
    return Response.json(
      {
        error: "This attendance register has already been saved and is locked.",
      },
      { status: 409 },
    );
  const { error } = await admin.from("class_attendance").upsert(
    value.rows.map((row) => ({
      class_id: value.classId,
      batch_id: value.batchId,
      student_id: row.studentId,
      attendance_date: value.date,
      status: row.status,
      recorded_by: user.id,
      updated_at: now,
    })),
    { onConflict: "class_id,batch_id,student_id,attendance_date" },
  );
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
