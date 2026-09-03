import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";
import { intakeSchema } from "@/lib/intake-batch-schemas";

async function actor(action: "edit" | "delete") {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  return user && (await adminActorCan(user.id, "intakes", action))
    ? user
    : null;
}
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!(await actor("edit")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = intakeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "Enter valid intake details" },
      { status: 400 },
    );
  const { data, error } = await createAdminClient()
    .from("intakes")
    .update({
      ...parsed.data,
      description: parsed.data.description || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select("*")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  if (!(await actor("delete")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("intakes")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
