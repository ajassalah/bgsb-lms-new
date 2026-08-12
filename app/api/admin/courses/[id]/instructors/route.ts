import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data: actor } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (actor?.role !== "super_admin")
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .object({ instructor_ids: z.array(z.string().uuid()) })
    .safeParse(await request.json());
  if (!parsed.success)
    return Response.json({ error: "Invalid instructors" }, { status: 400 });
  const admin = createAdminClient();
  await admin.from("course_instructors").delete().eq("course_id", params.id);
  if (parsed.data.instructor_ids.length) {
    const { error } = await admin
      .from("course_instructors")
      .insert(
        parsed.data.instructor_ids.map((instructor_id) => ({
          course_id: params.id,
          instructor_id,
          assigned_by: user.id,
        })),
      );
    if (error) return Response.json({ error: error.message }, { status: 400 });
  }
  await admin
    .from("courses")
    .update({ instructor_id: parsed.data.instructor_ids[0] || null })
    .eq("id", params.id);
  return Response.json({ ok: true });
}
