import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { CourseInstructorManagement } from "@/components/course-instructor-management";
export default async function ManageCourseInstructors({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("admin_staff"),
    db = createAdminClient();
  const [{ data: course }, { data: instructors }, { data: assigned }] =
    await Promise.all([
      db.from("courses").select("title").eq("id", params.id).single(),
      db
        .from("profiles")
        .select("id,full_name,email,avatar_url")
        .eq("role", "instructor")
        .eq("status", "active")
        .order("full_name"),
      db
        .from("course_instructors")
        .select("instructor_id")
        .eq("course_id", params.id),
    ]);
  if (!course) notFound();
  return (
    <StaffPageShell name={profile.full_name}>
      <CourseInstructorManagement
        courseId={params.id}
        courseTitle={course.title}
        instructors={(instructors || []).map((x) => ({
          id: x.id,
          name: x.full_name,
          email: x.email,
          avatar: x.avatar_url,
        }))}
        initialAssigned={(assigned || []).map((x) => x.instructor_id)}
      />
    </StaffPageShell>
  );
}
