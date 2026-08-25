import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { adminActorCan } from "@/lib/staff-permissions";

async function allowed(action: "edit" | "delete") {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return false;
  return adminActorCan(user.id, "curriculum", action);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!(await allowed("edit")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .object({ title: z.string().trim().min(2) })
    .safeParse(await request.json());
  if (!parsed.success)
    return Response.json(
      { error: "Enter a valid quiz title" },
      { status: 400 },
    );
  const { data, error } = await createAdminClient()
    .from("quizzes")
    .update(parsed.data)
    .eq("id", params.id)
    .select("id,title")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  if (!(await allowed("delete")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("quizzes")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
