import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";
import { z } from "zod";
async function allowed(action: string) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  return !!user && (await adminActorCan(user.id, "categories", action));
}
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await req.json(),
    action =
      typeof body.is_active === "boolean" && !body.name ? "status" : "edit";
  if (!(await allowed(action)))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .object({
      name: z.string().trim().min(2).max(100).optional(),
      is_active: z.boolean().optional(),
    })
    .safeParse(body);
  if (!parsed.success)
    return Response.json({ error: "Invalid update" }, { status: 400 });
  const values: { name?: string; is_active?: boolean; slug?: string } = {
    ...parsed.data,
  };
  if (parsed.data.name)
    values.slug = `${parsed.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Date.now().toString(36)}`;
  const { data, error } = await createAdminClient()
    .from("categories")
    .update(values)
    .eq("id", params.id)
    .select("name,is_active")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ name: data.name, active: data.is_active });
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  if (!(await allowed("delete")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const db = createAdminClient(),
    { count } = await db
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("category_id", params.id);
  if (count)
    return Response.json(
      {
        error: `This category contains ${count} course${count === 1 ? "" : "s"}`,
      },
      { status: 409 },
    );
  const { error } = await db.from("categories").delete().eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
