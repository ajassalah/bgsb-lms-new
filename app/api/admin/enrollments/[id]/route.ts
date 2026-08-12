import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { adminActorCan } from "@/lib/staff-permissions";
import { createAdminClient } from "@/lib/supabase/admin";
async function admin(action: string) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return null;
  return (await adminActorCan(user.id, "enrollment", action))
    ? createAdminClient()
    : null;
}
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await req.json();
  const db = await admin(body.student_id || body.course_id ? "edit" : "status");
  if (!db) return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .object({
      status: z.enum(["pending", "approved", "declined", "completed"]),
      student_id: z.string().uuid().optional(),
      course_id: z.string().uuid().optional(),
    })
    .safeParse(body);
  if (!parsed.success)
    return Response.json(
      { error: "Invalid enrollment details" },
      { status: 400 },
    );
  const values: any = { ...parsed.data };
  if (parsed.data.student_id) {
    const { data: student } = await db
      .from("profiles")
      .select("organization_id")
      .eq("id", parsed.data.student_id)
      .eq("role", "student")
      .maybeSingle();
    if (!student)
      return Response.json({ error: "Student not found" }, { status: 404 });
    values.organization_id = student.organization_id;
  }
  const { error } = await db
    .from("enrollments")
    .update(values)
    .eq("id", params.id);
  return error
    ? Response.json(
        {
          error:
            error.code === "23505"
              ? "Student is already enrolled in this course"
              : error.message,
        },
        { status: 400 },
      )
    : Response.json({ ok: true });
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const db = await admin("delete");
  if (!db) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await db.from("enrollments").delete().eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
