import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { staffCan } from "@/lib/staff-permissions";
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { data: p } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const allowed =
    p?.role === "super_admin" ||
    (p?.role === "admin_staff" &&
      (await staffCan(user.id, "certificates", "remove_certificate")));
  if (!allowed)
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("certificate_templates")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
