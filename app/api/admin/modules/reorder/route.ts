import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { adminActorCan } from "@/lib/staff-permissions";
export async function PATCH(req: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await adminActorCan(user.id, "curriculum", "edit")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .object({
      course_id: z.string().uuid(),
      module_ids: z.array(z.string().uuid()).min(1),
    })
    .safeParse(await req.json());
  if (!parsed.success)
    return Response.json({ error: "Invalid order" }, { status: 400 });
  const admin = createAdminClient();
  for (let i = 0; i < parsed.data.module_ids.length; i++) {
    const { error } = await admin
      .from("course_modules")
      .update({ position: i + 1 })
      .eq("id", parsed.data.module_ids[i])
      .eq("course_id", parsed.data.course_id);
    if (error) return Response.json({ error: error.message }, { status: 400 });
  }
  return Response.json({ ok: true });
}
