import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function authorize() {
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
  return ["super_admin", "admin_staff"].includes(data?.role || "");
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await authorize()))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .union([
      z.object({ status: z.enum(["active", "inactive"]) }),
      z.object({
        question: z.string().trim().min(2),
        answer: z.string().trim().min(2),
        status: z.enum(["active", "inactive"]),
      }),
    ])
    .safeParse(await req.json());
  if (!parsed.success)
    return Response.json({ error: "Invalid FAQ details" }, { status: 400 });
  const { error } = await createAdminClient()
    .from("support_faqs")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  if (!(await authorize()))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("support_faqs")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
