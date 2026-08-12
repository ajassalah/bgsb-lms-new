import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
const reservedPortalRoles = ["Instructor", "Student"];
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
  if (
    reservedPortalRoles.some(
      (role) => role.toLowerCase() === p.data.name.toLowerCase(),
    )
  )
    return Response.json(
      {
        error:
          "Instructor and Student use separate portals and cannot be staff roles",
      },
      { status: 400 },
    );
  const { data, error } = await createAdminClient()
    .from("staff_roles")
    .upsert(
      { ...p.data, updated_at: new Date().toISOString() },
      { onConflict: "name" },
    )
    .select("id")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
export async function GET() {
  if (!(await ok()))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { data, error } = await createAdminClient()
    .from("staff_roles")
    .select("id,name,permissions")
    .not("name", "in", "(Instructor,Student)")
    .order("name");
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ items: data || [] });
}
