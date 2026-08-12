import { DashboardShell } from "@/components/dashboard-shell";
import { InstructorStudentList } from "@/components/instructor-student-list";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function MyStudents() {
  const profile = await requireProfile("instructor"),
    admin = createAdminClient(),
    { data: links } = await admin
      .from("course_instructors")
      .select("course_id")
      .eq("instructor_id", profile.id),
    courseIds = (links || []).map((x) => x.course_id);
  const { data: enrollments } = courseIds.length
    ? await admin
        .from("enrollments")
        .select(
          "student_id,student:profiles!enrollments_student_id_fkey(id,full_name,email,phone,country,avatar_url)",
        )
        .in("course_id", courseIds)
    : { data: [] };
  const unique = new Map<string, any>();
  for (const row of enrollments || []) {
    const student = (row as any).student;
    if (student && !unique.has(student.id)) unique.set(student.id, student);
  }
  return (
    <DashboardShell role="instructor" name={profile.full_name}>
      <InstructorStudentList
        students={Array.from(unique.values()).map((x: any) => ({
          id: x.id,
          name: x.full_name,
          email: x.email,
          phone: x.phone,
          country: x.country,
          avatar: x.avatar_url,
        }))}
      />
    </DashboardShell>
  );
}
