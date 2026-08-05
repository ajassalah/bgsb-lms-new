import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
async function ok() {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return false;
  const { data } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return data?.role === "super_admin";
}
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await ok()))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const p = z
    .object({ name: z.string().trim().min(2), permissions: z.record(z.any()) })
    .safeParse(await req.json());
  if (!p.success)
    return Response.json({ error: "Invalid role" }, { status: 400 });
  const { error } = await createAdminClient()
    .from("staff_roles")
    .update({ ...p.data, updated_at: new Date().toISOString() })
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  if (!(await ok()))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("staff_roles")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
