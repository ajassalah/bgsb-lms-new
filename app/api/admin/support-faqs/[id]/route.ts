import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";
import { revalidatePath } from "next/cache";

async function authorize(action: string) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return false;
  return adminActorCan(user.id, "faq", action);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await req.json();
  if (
    !(await authorize(
      Object.keys(body).length === 1 && body.status ? "status" : "edit",
    ))
  )
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .union([
      z
        .object({
          question: z.string().trim().min(2),
          answer: z.string().trim().min(2),
          status: z.enum(["active", "inactive"]),
        })
        .strict(),
      z.object({ status: z.enum(["active", "inactive"]) }).strict(),
    ])
    .safeParse(body);
  if (!parsed.success)
    return Response.json({ error: "Invalid FAQ details" }, { status: 400 });
  const { data, error } = await createAdminClient()
    .from("support_faqs")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .select("id,question,answer,status,updated_at")
    .maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  if (!data)
    return Response.json({ error: "FAQ was not found" }, { status: 404 });
  revalidatePath("/dashboard/super-admin/support/faq");
  revalidatePath("/dashboard/admin-staff/support/faq");
  revalidatePath(`/dashboard/super-admin/support/faq/${params.id}/edit`);
  revalidatePath(`/dashboard/admin-staff/support/faq/${params.id}/edit`);
  return Response.json({ ok: true, faq: data });
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  if (!(await authorize("delete")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("support_faqs")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
