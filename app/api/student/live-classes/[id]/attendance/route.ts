import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "student")
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .object({ action: z.enum(["join", "leave"]) })
    .safeParse(await request.json());
  if (!parsed.success)
    return Response.json({ error: "Invalid action" }, { status: 400 });

  const admin = createAdminClient();
  const [{ data: direct }, { data: courseLinks }] = await Promise.all([
    admin
      .from("live_session_students")
      .select("session_id")
      .eq("session_id", params.id)
      .eq("student_id", user.id)
      .maybeSingle(),
    admin
      .from("live_session_courses")
      .select("course_id")
      .eq("session_id", params.id),
  ]);
  let allowed = !!direct;
  if (!allowed && courseLinks?.length) {
    const { data: enrollment } = await admin
      .from("enrollments")
      .select("id")
      .eq("student_id", user.id)
      .in(
        "course_id",
        courseLinks.map((item) => item.course_id),
      )
      .in("status", ["approved", "completed"])
      .limit(1)
      .maybeSingle();
    allowed = !!enrollment;
  }
  if (!allowed) return Response.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date().toISOString();
  if (parsed.data.action === "join") {
    const { error } = await admin.from("session_attendance").insert({
      session_id: params.id,
      student_id: user.id,
      joined_at: now,
    });
    return error
      ? Response.json({ error: error.message }, { status: 400 })
      : Response.json({ ok: true });
  }
  const { data: active } = await admin
    .from("session_attendance")
    .select("id")
    .eq("session_id", params.id)
    .eq("student_id", user.id)
    .is("left_at", null)
    .order("joined_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (active)
    await admin
      .from("session_attendance")
      .update({ left_at: now })
      .eq("id", active.id);
  return Response.json({ ok: true });
}
