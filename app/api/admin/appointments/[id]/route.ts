import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
  return data && ["super_admin", "admin_staff"].includes(data.role) ? db : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const db = await authorized();
  if (!db) return Response.json({ error: "Forbidden" }, { status: 403 });
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
  const { data, error } = await db
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
  return Response.json(data);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["super_admin", "admin_staff"].includes(profile.role))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await db
    .from("calendar_appointments")
    .delete()
    .eq("id", params.id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  revalidatePath("/dashboard/super-admin");
  revalidatePath("/dashboard/super-admin/calendar");
  return Response.json({ ok: true });
}
