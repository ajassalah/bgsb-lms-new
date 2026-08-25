import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";
async function admin(action: "edit" | "delete") {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return null;
  return (await adminActorCan(user.id, "curriculum", action))
    ? createAdminClient()
    : null;
}
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const db = await admin("edit");
  if (!db) return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .object({
      title: z.string().trim().min(2),
      description: z.string().trim().optional(),
    })
    .safeParse(await req.json());
  if (!parsed.success)
    return Response.json({ error: "Invalid title" }, { status: 400 });
  const { data, error } = await db
    .from("course_modules")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
    })
    .eq("id", params.id)
    .select("id,title,description")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const db = await admin("delete");
  if (!db) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await db
    .from("course_modules")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
