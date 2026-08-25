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
  const admin = createAdminClient();
  const parsed = z
    .object({
      course_id: z.string().uuid(),
      title: z.string().trim().min(2),
      description: z.string().trim().optional(),
    })
    .safeParse(await req.json());
  if (!parsed.success)
    return Response.json({ error: "Invalid module" }, { status: 400 });
  const { data: last } = await admin
    .from("course_modules")
    .select("position")
    .eq("course_id", parsed.data.course_id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data, error } = await admin
    .from("course_modules")
    .insert({
      ...parsed.data,
      description: parsed.data.description || null,
      position: (last?.position || 0) + 1,
    })
    .select("id,title,description,position")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ...data, lessons: 0, quizzes: 0 });
}
