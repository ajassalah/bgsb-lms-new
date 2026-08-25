import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

async function authorized() {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return null;
  const { data } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return data &&
    ["super_admin", "admin_staff", "instructor", "student"].includes(data.role)
    ? { db, user, role: data.role }
    : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const actor = await authorized();
  if (!actor) return Response.json({ error: "Forbidden" }, { status: 403 });
  const admin = createAdminClient();
  if (["instructor", "student"].includes(actor.role)) {
    const { data: owned } = await admin
      .from("calendar_appointments")
      .select("id")
      .eq("id", params.id)
      .eq("created_by", actor.user.id)
      .maybeSingle();
    if (!owned)
      return Response.json(
        { error: "You can edit only your own appointments" },
        { status: 403 },
      );
  }
  const parsed = z
    .object({
      title: z.string().trim().min(2),
      description: z.string().trim().optional(),
      scheduled_start: z.string().min(1),
      scheduled_end: z.string().optional(),
    })
    .safeParse(await request.json());
  if (!parsed.success)
    return Response.json(
      { error: "Enter valid appointment details" },
      { status: 400 },
    );
  const start = new Date(parsed.data.scheduled_start),
    end = parsed.data.scheduled_end
      ? new Date(parsed.data.scheduled_end)
      : null;
  if (end && end <= start)
    return Response.json(
      { error: "End time must be after the start time" },
      { status: 400 },
    );
  const { data, error } = await admin
    .from("calendar_appointments")
    .update({
      title: parsed.data.title,
      description: parsed.data.description || null,
      scheduled_start: start.toISOString(),
      scheduled_end: end?.toISOString() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .select("id,title,description,scheduled_start,scheduled_end")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  revalidatePath("/dashboard/super-admin");
  revalidatePath("/dashboard/super-admin/calendar");
  revalidatePath("/dashboard/instructor/calendar");
  return Response.json(data);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const actor = await authorized();
  if (!actor) return Response.json({ error: "Forbidden" }, { status: 403 });
  const admin = createAdminClient();
  if (["instructor", "student"].includes(actor.role)) {
    const { data: owned } = await admin
      .from("calendar_appointments")
      .select("id")
      .eq("id", params.id)
      .eq("created_by", actor.user.id)
      .maybeSingle();
    if (!owned)
      return Response.json(
        { error: "You can delete only your own appointments" },
        { status: 403 },
      );
  }
  await admin
    .from("calendar_appointment_users")
    .delete()
    .eq("appointment_id", params.id);
  const { data: deleted, error } = await admin
    .from("calendar_appointments")
    .delete()
    .eq("id", params.id)
    .select("id")
    .maybeSingle();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  if (!deleted)
    return Response.json(
      { error: "Scheduled event was not found or was already deleted" },
      { status: 404 },
    );
  revalidatePath("/dashboard/super-admin");
  revalidatePath("/dashboard/super-admin/calendar");
  revalidatePath("/dashboard/admin-staff");
  revalidatePath("/dashboard/admin-staff/calendar");
  revalidatePath("/dashboard/instructor");
  revalidatePath("/dashboard/instructor/calendar");
  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/student/calendar");
  return Response.json({ ok: true });
}
