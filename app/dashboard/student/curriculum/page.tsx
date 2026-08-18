import { DashboardShell } from "@/components/dashboard-shell";
import { StudentCurriculumList } from "@/components/student-curriculum-list";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function StudentCurriculumPage() {
  const profile = await requireProfile("student"),
    { data } = await createAdminClient()
      .from("enrollments")
      .select("course:courses(id,title,status,category:categories(name))")
      .eq("student_id", profile.id)
      .in("status", ["approved", "completed"]);
  const courses = (data || [])
    .map((row: any) => row.course)
    .filter(Boolean)
    .map((course: any) => ({
      id: course.id,
      title: course.title,
      category: course.category?.name || "Uncategorized",
      status: course.status || "published",
    }));
  return (
    <DashboardShell
      role="student"
      name={profile.full_name}
      email={profile.email}
      avatar={profile.avatar_url}
    >
      <StudentCurriculumList courses={courses} />
    </DashboardShell>
  );
}
