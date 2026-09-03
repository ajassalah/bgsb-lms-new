import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";
import { batchEndDate } from "@/lib/batch-dates";
import { batchSchema } from "@/lib/intake-batch-schemas";
export async function POST(request: Request) {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user || !(await adminActorCan(user.id, "batches", "create")))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = batchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "Enter valid batch details" },
      { status: 400 },
    );
  const admin = createAdminClient();
  const { data: intake } = await admin
    .from("intakes")
    .select("course_id")
    .eq("id", parsed.data.intake_id)
    .maybeSingle();
  if (!intake || intake.course_id !== parsed.data.course_id)
    return Response.json(
      { error: "Select an intake created for this course" },
      { status: 400 },
    );
  const { data, error } = await createAdminClient()
    .from("batches")
    .insert({
      ...parsed.data,
      end_date: batchEndDate(
        parsed.data.start_date,
        parsed.data.duration_value,
        parsed.data.duration_unit,
      ),
      created_by: user.id,
    })
    .select("*")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
