import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

async function allowed() {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return false;
  const { data } = await createAdminClient()
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return data?.role === "super_admin";
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!(await allowed()))
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
  if (!(await allowed()))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("quizzes")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
