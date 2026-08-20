import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: { courseId: string; studentId: string } },
) {
  const db = createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!["super_admin", "admin_staff"].includes(profile?.role || ""))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const parsed = z
    .object({
      status: z.enum([
        "certificate_claimed",
        "certificate_issued",
        "waiting_for_hardcopy",
        "done",
      ]),
    })
    .safeParse(await request.json());
  if (!parsed.success)
    return Response.json(
      { error: "Select a valid certificate status" },
      { status: 400 },
    );
  const { data, error } = await admin
    .from("certificate_verifications")
    .upsert(
      {
        course_id: params.courseId,
        student_id: params.studentId,
        status: parsed.data.status,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "course_id,student_id" },
    )
    .select("status")
    .single();
  return error
    ? Response.json({ error: error.message }, { status: 400 })
    : Response.json(data);
}
