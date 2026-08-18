import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminActorCan } from "@/lib/staff-permissions";
import { z } from "zod";
import { revalidatePath } from "next/cache";
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const db = createClient(),
    {
      data: { user },
    } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  const [{ data: profile }, { data: appointment }] = await Promise.all([
    admin.from("profiles").select("role").eq("id", user.id).single(),
    admin
      .from("calendar_appointments")
      .select("created_by")
      .eq("id", params.id)
      .single(),
  ]);
  const ownsAppointment = appointment?.created_by === user.id;
  const canAssign =
    ownsAppointment ||
    profile?.role === "super_admin" ||
    (await adminActorCan(user.id, "calendar", "status"));
  if (!canAssign)
    return Response.json(
      { error: "Missing Calendar Status permission" },
      { status: 403 },
    );
  const parsed = z
    .object({ user_ids: z.array(z.string().uuid()) })
    .safeParse(await req.json());
  if (!parsed.success)
    return Response.json({ error: "Invalid users" }, { status: 400 });
  await admin
    .from("calendar_appointment_users")
    .delete()
    .eq("appointment_id", params.id);
  if (parsed.data.user_ids.length) {
    const { error } = await admin.from("calendar_appointment_users").insert(
      parsed.data.user_ids.map((user_id) => ({
        appointment_id: params.id,
        user_id,
        assigned_by: user.id,
      })),
    );
    if (error) return Response.json({ error: error.message }, { status: 400 });
    const { data: recipients } = await admin
      .from("profiles")
      .select("id,role")
      .in("id", parsed.data.user_ids);
    await admin.from("user_notifications").insert(
      (recipients || []).map((recipient) => ({
        user_id: recipient.id,
        title: "A calendar event was assigned to you",
        url: `/dashboard/${recipient.role.replace("_", "-")}/calendar`,
      })),
    );
  }
  for (const path of [
    "/dashboard/instructor",
    "/dashboard/instructor/calendar",
    "/dashboard/student",
    "/dashboard/student/calendar",
    "/dashboard/admin-staff",
    "/dashboard/admin-staff/calendar",
  ])
    revalidatePath(path);
  return Response.json({ ok: true });
}
