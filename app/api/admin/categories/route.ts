import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";
import { z } from "zod";
export async function POST(req: Request) {
  const auth = createClient(),
    {
      data: { user },
    } = await auth.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await adminActorCan(user.id, "categories", "create")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .object({ name: z.string().trim().min(2).max(100) })
    .safeParse(await req.json());
  if (!parsed.success)
    return Response.json(
      { error: "Enter a valid category name" },
      { status: 400 },
    );
  const base = parsed.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    db = createAdminClient(),
    { data, error } = await db
      .from("categories")
      .insert({
        name: parsed.data.name,
        slug: `${base}-${Date.now().toString(36)}`,
        is_active: true,
      })
      .select("id,name,is_active")
      .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ id: data.id, name: data.name, active: data.is_active });
}
