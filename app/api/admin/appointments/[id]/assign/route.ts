import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";
import { z } from "zod";
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await adminActorCan(user.id, "calendar", "status")))
    return Response.json(
      { error: "Missing Calendar Status permission" },
      { status: 403 },
    );
  const parsed = z
    .object({ user_ids: z.array(z.string().uuid()) })
    .safeParse(await req.json());
  if (!parsed.success)
    return Response.json({ error: "Invalid users" }, { status: 400 });
  const admin = createAdminClient();
  await admin
    .from("calendar_appointment_users")
    .delete()
    .eq("appointment_id", params.id);
  if (parsed.data.user_ids.length) {
    const { error } = await admin
      .from("calendar_appointment_users")
      .insert(
        parsed.data.user_ids.map((user_id) => ({
          appointment_id: params.id,
          user_id,
          assigned_by: user.id,
        })),
      );
    if (error) return Response.json({ error: error.message }, { status: 400 });
    await admin
      .from("user_notifications")
      .insert(
        parsed.data.user_ids.map((user_id) => ({
          user_id,
          title: "A calendar event was assigned to you",
          url: "/dashboard",
        })),
      );
  }
  return Response.json({ ok: true });
}
