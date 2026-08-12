import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function authorize() {
  const db = createClient(), { data: { user } } = await db.auth.getUser();
  if (!user) return null;
  const { data } = await db.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data?.role === "super_admin" ? user : null;
}
export async function POST(_: Request, { params }: { params: { courseId: string; studentId: string } }) {
  if (!(await authorize())) return Response.json({ error: "Forbidden" }, { status: 403 });
  const admin = createAdminClient();
  const [{ data: enrollment }, { data: template }] = await Promise.all([
    admin.from("enrollments").select("id").eq("course_id", params.courseId).eq("student_id", params.studentId).in("status", ["approved", "completed"]).maybeSingle(),
    admin.from("certificate_templates").select("certificate_url").eq("course_id", params.courseId).maybeSingle(),
  ]);
  if (!enrollment) return Response.json({ error: "Student is not enrolled in this course" }, { status: 400 });
  if (!template?.certificate_url) return Response.json({ error: "Add a course certificate template first" }, { status: 400 });
  const { data, error } = await admin.from("certificates").upsert({ course_id: params.courseId, student_id: params.studentId, certificate_url: template.certificate_url, issued_at: new Date().toISOString() }, { onConflict: "student_id,course_id" }).select("id,issued_at").single();
  return error ? Response.json({ error: error.message }, { status: 400 }) : Response.json(data);
}
export async function DELETE(_: Request, { params }: { params: { courseId: string; studentId: string } }) {
  if (!(await authorize())) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { error } = await createAdminClient().from("certificates").delete().eq("course_id", params.courseId).eq("student_id", params.studentId);
  return error ? Response.json({ error: error.message }, { status: 400 }) : Response.json({ ok: true });
}
