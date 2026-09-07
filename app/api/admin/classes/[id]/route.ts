import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";

async function allowed() {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  return !!user && (await adminActorCan(user.id, "class_management", "access"));
}

const schema = z.object({
  subject: z.string().trim().min(1),
  courseIds: z.array(z.string().uuid()).min(1),
  batchIds: z.array(z.string().uuid()).min(1),
  instructorIds: z.array(z.string().uuid()).min(1),
  staffIds: z.array(z.string().uuid()).default([]),
  liveSessionId: z.string().uuid(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!(await allowed()))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success)
    return Response.json(
      { error: "Complete all required class details." },
      { status: 400 },
    );
  const db = createAdminClient(),
    value = parsed.data;
  const { data: session } = await db
    .from("live_sessions")
    .select("scheduled_start")
    .eq("id", value.liveSessionId)
    .maybeSingle();
  if (!session)
    return Response.json(
      { error: "Select a valid scheduled live class link." },
      { status: 400 },
    );
  const { error } = await db
    .from("generated_classes")
    .update({
      subject: value.subject,
      live_session_id: value.liveSessionId,
      scheduled_at: session.scheduled_start,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 400 });

  await Promise.all([
    db.from("generated_class_courses").delete().eq("class_id", params.id),
    db.from("generated_class_batches").delete().eq("class_id", params.id),
    db.from("generated_class_instructors").delete().eq("class_id", params.id),
    db.from("generated_class_staff").delete().eq("class_id", params.id),
  ]);
  const writes = [
    db.from("generated_class_courses").insert(
      value.courseIds.map((course_id) => ({
        class_id: params.id,
        course_id,
      })),
    ),
    db
      .from("generated_class_batches")
      .insert(
        value.batchIds.map((batch_id) => ({ class_id: params.id, batch_id })),
      ),
    db.from("generated_class_instructors").insert(
      value.instructorIds.map((instructor_id) => ({
        class_id: params.id,
        instructor_id,
      })),
    ),
    value.staffIds.length
      ? db.from("generated_class_staff").insert(
          value.staffIds.map((staff_id) => ({
            class_id: params.id,
            staff_id,
          })),
        )
      : Promise.resolve({ error: null }),
  ];
  const results = await Promise.all(writes);
  const writeError = results.find((result) => result.error)?.error;
  return writeError
    ? Response.json({ error: writeError.message }, { status: 400 })
    : Response.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  if (!(await allowed()))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("generated_classes")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
