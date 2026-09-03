import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";
import { batchSchema } from "@/lib/intake-batch-schemas";
import { batchEndDate } from "@/lib/batch-dates";

async function actor(action: "edit" | "delete" | "verify") {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  return user && (await adminActorCan(user.id, "batches", action))
    ? user
    : null;
}
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = await request.json().catch(() => null);
  const statusOnly = z
    .object({ status: z.enum(["active", "inactive", "draft"]) })
    .safeParse(body);
  const full = batchSchema.safeParse(body);
  if (!full.success && !statusOnly.success)
    return Response.json(
      { error: "Enter valid batch details" },
      { status: 400 },
    );
  const isStatusOnly = !full.success && statusOnly.success;
  if (!(await actor(isStatusOnly ? "verify" : "edit")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  if (full.success) {
    const { data: intake } = await createAdminClient()
      .from("intakes")
      .select("course_id")
      .eq("id", full.data.intake_id)
      .maybeSingle();
    if (!intake || intake.course_id !== full.data.course_id)
      return Response.json(
        { error: "Select an intake created for this course" },
        { status: 400 },
      );
  }
  const values = full.success
    ? {
        ...full.data,
        end_date: batchEndDate(
          full.data.start_date,
          full.data.duration_value,
          full.data.duration_unit,
        ),
        updated_at: new Date().toISOString(),
      }
    : {
        status: statusOnly.success ? statusOnly.data.status : "draft",
        updated_at: new Date().toISOString(),
      };
  const { data, error } = await createAdminClient()
    .from("batches")
    .update(values)
    .eq("id", params.id)
    .select("*")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  if (!(await actor("delete")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient()
    .from("batches")
    .delete()
    .eq("id", params.id);
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json({ ok: true });
}
