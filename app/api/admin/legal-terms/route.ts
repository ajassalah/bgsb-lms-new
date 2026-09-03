import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";

export async function POST(request: Request) {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user || !(await adminActorCan(user.id, "terms_conditions", "access")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .object({
      id: z.string().uuid().optional(),
      version: z.string().trim().min(1).max(30),
      title: z.string().trim().min(3).max(160),
      effective_date: z.string().min(1),
      content: z.string().trim().min(50),
      is_published: z.boolean(),
    })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "Enter complete Terms & Conditions details" },
      { status: 400 },
    );
  const admin = createAdminClient();
  const values = {
    version: parsed.data.version,
    title: parsed.data.title,
    effective_date: parsed.data.effective_date,
    content: parsed.data.content,
    is_published: parsed.data.is_published,
    published_at: parsed.data.is_published ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
    created_by: user.id,
  };
  const { data, error } = await admin
    .from("legal_terms")
    .upsert(values, { onConflict: "version" })
    .select(
      "id,version,title,effective_date,content,is_published,published_at,updated_at",
    )
    .single();
  if (!error && data && parsed.data.is_published)
    await admin
      .from("legal_terms")
      .update({ is_published: false })
      .neq("id", data.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
