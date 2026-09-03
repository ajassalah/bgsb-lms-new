import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { CourseStudentManagement } from "@/components/course-student-management";
export default async function CourseStudents({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("admin_staff"),
    db = createAdminClient();
  const [
    { data: course },
    { data: students },
    { data: enrollments },
    { data: batches },
  ] = await Promise.all([
    db.from("courses").select("title").eq("id", params.id).single(),
    db
      .from("profiles")
      .select("id,full_name,email")
      .eq("role", "student")
      .eq("status", "active")
      .order("full_name"),
    db
      .from("enrollments")
      .select(
        "id,student_id,enrolled_at,status,student:profiles!enrollments_student_id_fkey(full_name,email)",
      )
      .eq("course_id", params.id)
      .order("enrolled_at", { ascending: false }),
    db
      .from("batches")
      .select("id,batch_name")
      .eq("course_id", params.id)
      .order("batch_name"),
  ]);
  if (!course) notFound();
  return (
    <StaffPageShell name={profile.full_name}>
      <CourseStudentManagement
        courseId={params.id}
        courseTitle={course.title}
        batches={(batches || []).map((x) => ({ id: x.id, name: x.batch_name }))}
        allStudents={(students || []).map((x) => ({
          id: x.id,
          name: x.full_name,
          email: x.email,
        }))}
        initialEnrolled={(enrollments || []).map((x: any) => ({
          id: x.student_id,
          enrollmentId: x.id,
          name: x.student?.full_name || "Student",
          email: x.student?.email || "",
          date: x.enrolled_at,
          status: x.status,
        }))}
      />
    </StaffPageShell>
  );
}
