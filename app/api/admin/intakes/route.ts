import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";
import { intakeSchema as schema } from "@/lib/intake-batch-schemas";

export async function POST(request: Request) {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user || !(await adminActorCan(user.id, "intakes", "create")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "Enter valid intake details" },
      { status: 400 },
    );
  const { data, error } = await createAdminClient()
    .from("intakes")
    .insert({
      ...parsed.data,
      description: parsed.data.description || null,
      created_by: user.id,
    })
    .select("*")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
