import { DashboardShell } from "@/components/dashboard-shell";
import { StudentCurriculumList } from "@/components/student-curriculum-list";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function InstructorCurriculumPage() {
  const profile = await requireProfile("instructor"),
    { data } = await createAdminClient()
      .from("course_instructors")
      .select("course:courses(id,title,status,category:categories(name))")
      .eq("instructor_id", profile.id);
  const courses = (data || [])
    .map((row: any) => row.course)
    .filter(Boolean)
    .map((course: any) => ({
      id: course.id,
      title: course.title,
      category: course.category?.name || "Uncategorized",
      status: course.status || "draft",
    }));
  return (
    <DashboardShell
      role="instructor"
      name={profile.full_name}
      email={profile.email}
      avatar={profile.avatar_url}
    >
      <StudentCurriculumList
        courses={courses}
        basePath="/dashboard/instructor/curriculum"
        portalLabel="Instructor"
      />
    </DashboardShell>
  );
}
