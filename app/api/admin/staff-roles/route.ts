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
export async function POST(req: Request) {
  if (!(await ok()))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const p = z
    .object({ name: z.string().trim().min(2), permissions: z.record(z.any()) })
    .safeParse(await req.json());
  if (!p.success)
    return Response.json({ error: "Invalid role" }, { status: 400 });
  const { data, error } = await createAdminClient()
    .from("staff_roles")
    .insert(p.data)
    .select("id")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
