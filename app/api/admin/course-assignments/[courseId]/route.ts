import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
export async function DELETE(
  _: Request,
  { params }: { params: { courseId: string } },
) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "super_admin")
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("assignments")
    .delete()
    .eq("course_id", params.courseId);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
