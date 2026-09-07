import { DashboardShell } from "@/components/dashboard-shell";
import { InstructorCourseList } from "@/components/instructor-student-list";
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
  const { data: courses } = courseIds.length
    ? await admin
        .from("courses")
        .select("id,title,enrollments(count)")
        .in("id", courseIds)
        .order("title")
    : { data: [] };
  return (
    <DashboardShell role="instructor" name={profile.full_name}>
      <InstructorCourseList
        courses={(courses || []).map((course: any) => ({
          id: course.id,
          title: course.title,
          students: course.enrollments?.[0]?.count || 0,
        }))}
      />
    </DashboardShell>
  );
}
