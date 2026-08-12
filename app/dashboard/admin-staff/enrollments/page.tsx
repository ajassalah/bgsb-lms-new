import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import {
  EnrollmentManagement,
  type EnrollmentRow,
} from "@/components/enrollment-management";
export default async function EnrollmentsPage() {
  const profile = await requireProfile("admin_staff"),
    db = createAdminClient();
  const [{ data }, { data: students }, { data: courses }] = await Promise.all([
    db
      .from("enrollments")
      .select(
        "id,student_id,course_id,status,enrolled_at,student:profiles!enrollments_student_id_fkey(full_name,email),course:courses!enrollments_course_id_fkey(title)",
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
  }));
  return (
    <StaffPageShell name={profile.full_name}>
      <EnrollmentManagement
        initialRows={rows}
        students={(students || []).map((x) => ({
          id: x.id,
          name: `${x.full_name} (${x.email})`,
        }))}
        courses={(courses || []).map((x) => ({ id: x.id, name: x.title }))}
      />
    </StaffPageShell>
  );
}
