import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
async function currentUser() {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  return user;
}
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = z
    .object({ body: z.string().trim().min(1).max(5000) })
    .safeParse(await request.json());
  if (!parsed.success)
    return Response.json({ error: "Enter a valid message" }, { status: 400 });
  const { data, error } = await createAdminClient()
    .from("direct_messages")
    .update({ body: parsed.data.body })
    .eq("id", params.id)
    .eq("sender_id", user.id)
    .select("id,body")
    .maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  if (!data)
    return Response.json(
      { error: "You can edit only your own messages" },
      { status: 403 },
    );
  return Response.json(data);
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient(),
    { data } = await admin
      .from("direct_messages")
      .select("id")
      .eq("id", params.id)
      .eq("sender_id", user.id)
      .maybeSingle();
  if (!data)
    return Response.json(
      { error: "You can delete only your own messages" },
      { status: 403 },
    );
  const { error } = await admin
    .from("direct_messages")
    .delete()
    .eq("id", params.id)
    .eq("sender_id", user.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
