import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

async function adminUser() {
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
  return ["super_admin", "admin_staff", "instructor", "student"].includes(
    data?.role || "",
  )
    ? user
    : null;
}

export async function POST(request: Request) {
  const user = await adminUser();
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
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
      { error: "Enter a title and appointment date" },
      { status: 400 },
    );
  const start = new Date(parsed.data.scheduled_start);
  const end = parsed.data.scheduled_end
    ? new Date(parsed.data.scheduled_end)
    : null;
  if (end && end <= start)
    return Response.json(
      { error: "End time must be after the start time" },
      { status: 400 },
    );
  const db = createAdminClient();
  const { data, error } = await db
    .from("calendar_appointments")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description || null,
      scheduled_start: start.toISOString(),
      scheduled_end: end?.toISOString() || null,
      created_by: user.id,
    })
    .select("id,title,description,scheduled_start,scheduled_end")
    .single();
  if (error) return Response.json({ error: error.message }, { status: 400 });
  revalidatePath("/dashboard/super-admin");
  revalidatePath("/dashboard/super-admin/calendar");
  revalidatePath("/dashboard/instructor/calendar");
  revalidatePath("/dashboard/instructor");
  revalidatePath("/dashboard/student/calendar");
  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/admin-staff");
  revalidatePath("/dashboard/admin-staff/calendar");
  return Response.json(data);
}
