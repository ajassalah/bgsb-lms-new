import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { adminActorCan } from "@/lib/staff-permissions";

async function authorized(action: "edit" | "delete") {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return false;
  return adminActorCan(user.id, "curriculum_assignments", action);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await authorized("edit")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData();
  const parsed = z
    .object({
      title: z.string().trim().min(2),
      due_date: z.string().min(1),
      instructor_id: z.string().uuid(),
      pass_marks: z.coerce.number().min(0),
      max_score: z.coerce.number().positive(),
      description: z.string().min(2),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return Response.json({ error: "Invalid assignment" }, { status: 400 });
  const admin = createAdminClient(),
    file = form.get("file");
  let file_url: string | undefined;
  if (file instanceof File && file.size) {
    const path = `assignments/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "-")}`;
    const upload = await admin.storage.from("course-media").upload(path, file, {
      contentType: file.type || "application/octet-stream",
    });
    if (upload.error)
      return Response.json({ error: upload.error.message }, { status: 400 });
    file_url = admin.storage.from("course-media").getPublicUrl(path)
      .data.publicUrl;
  }
  const { data, error } = await admin
    .from("assignments")
    .update({ ...parsed.data, ...(file_url ? { file_url } : {}) })
    .eq("id", params.id)
    .select("id,title,pass_marks,max_score,due_date")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  if (!(await authorized("delete")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("assignments")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
