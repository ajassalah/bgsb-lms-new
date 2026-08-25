import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";
export async function POST(req: Request) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await adminActorCan(user.id, "curriculum", "create")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .object({
      course_id: z.string().uuid(),
      module_id: z.string().uuid(),
      title: z.string().trim().min(2),
    })
    .safeParse(await req.json());
  if (!parsed.success)
    return Response.json({ error: "Invalid quiz" }, { status: 400 });
  const { data, error } = await createAdminClient()
    .from("quizzes")
    .insert(parsed.data)
    .select("id,title")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
