import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import {
  EnrollmentManagement,
  type EnrollmentRow,
} from "@/components/enrollment-management";
export default async function EnrollmentsPage() {
  const profile = await requireProfile("super_admin"),
    db = createClient();
  const [{ data }, { data: students }, { data: courses }, { data: batches }] =
    await Promise.all([
      db
        .from("enrollments")
        .select(
          "id,student_id,course_id,batch_id,status,enrolled_at,student:profiles!enrollments_student_id_fkey(full_name,email),course:courses!enrollments_course_id_fkey(title),batch:batches(batch_name)",
        )
        .order("enrolled_at", { ascending: false }),
      db
        .from("profiles")
        .select("id,full_name,email")
        .eq("role", "student")
        .eq("status", "active")
        .order("full_name"),
      db
        .from("courses")
        .select("id,title")
        .neq("status", "archived")
        .order("title"),
      db.from("batches").select("id,batch_name,course_id").order("batch_name"),
    ]);
  const rows: EnrollmentRow[] = (data || []).map((x: any) => ({
    id: x.id,
    studentId: x.student_id,
    student: x.student?.full_name || "Unknown student",
    studentEmail: x.student?.email || "",
    courseId: x.course_id,
    course: x.course?.title || "Unknown course",
    date: x.enrolled_at,
    status: x.status,
    batchId: x.batch_id || "",
    batch: x.batch?.batch_name || "",
  }));
  return (
    <SuperAdminShell name={profile.full_name}>
      <EnrollmentManagement
        initialRows={rows}
        students={(students || []).map((x) => ({
          id: x.id,
          name: `${x.full_name} (${x.email})`,
        }))}
        courses={(courses || []).map((x) => ({ id: x.id, name: x.title }))}
        batches={(batches || []).map((x) => ({
          id: x.id,
          name: x.batch_name,
          courseId: x.course_id,
        }))}
      />
    </SuperAdminShell>
  );
}
