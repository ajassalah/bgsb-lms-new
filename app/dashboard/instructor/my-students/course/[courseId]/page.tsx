import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { InstructorStudentList } from "@/components/instructor-student-list";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function CourseStudents({
  params,
}: {
  params: { courseId: string };
}) {
  const profile = await requireProfile("instructor");
  const admin = createAdminClient();
  const { data: assigned } = await admin
    .from("course_instructors")
    .select("course_id")
    .eq("course_id", params.courseId)
    .eq("instructor_id", profile.id)
    .maybeSingle();
  if (!assigned) notFound();
  const [{ data: course }, { data: enrollments }] = await Promise.all([
    admin.from("courses").select("title").eq("id", params.courseId).single(),
    admin
      .from("enrollments")
      .select(
        "student:profiles!enrollments_student_id_fkey(id,full_name,email,phone,country,avatar_url)",
      )
      .eq("course_id", params.courseId)
      .in("status", ["approved", "completed"]),
  ]);
  return (
    <DashboardShell
      role="instructor"
      name={profile.full_name}
      email={profile.email}
      avatar={profile.avatar_url}
    >
      <p className="mb-4 text-sm font-semibold text-red">
        {course?.title || "Course"}
      </p>
      <InstructorStudentList
        students={(enrollments || [])
          .map((row: any) => row.student)
          .filter(Boolean)
          .map((student: any) => ({
            id: student.id,
            name: student.full_name,
            email: student.email,
            phone: student.phone,
            country: student.country,
            avatar: student.avatar_url,
          }))}
      />
    </DashboardShell>
  );
}
