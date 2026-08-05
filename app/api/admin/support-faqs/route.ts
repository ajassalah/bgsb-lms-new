import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function authorize() {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return null;
  const { data } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return ["super_admin", "admin_staff"].includes(data?.role || "")
    ? user
    : null;
}

export async function POST(req: Request) {
  const user = await authorize();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .object({
      question: z.string().trim().min(2),
      answer: z.string().trim().min(2),
      status: z.enum(["active", "inactive"]),
    })
    .safeParse(await req.json());
  if (!parsed.success)
    return Response.json({ error: "Enter valid FAQ details" }, { status: 400 });
  const { data, error } = await createAdminClient()
    .from("support_faqs")
    .insert({ ...parsed.data, created_by: user.id })
    .select("id")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
