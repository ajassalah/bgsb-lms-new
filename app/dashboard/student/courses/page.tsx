import { DashboardShell } from "@/components/dashboard-shell";
import { InstructorCourseList } from "@/components/instructor-course-list";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function StudentCoursesPage() {
  const profile = await requireProfile("student"), admin = createAdminClient();
  const { data } = await admin.from("enrollments").select("course:courses(id,title,status,category:categories(name))").eq("student_id", profile.id).in("status", ["approved", "completed"]);
  return <DashboardShell role="student" name={profile.full_name} email={profile.email} avatar={profile.avatar_url}><InstructorCourseList studentView basePath="/dashboard/student/courses" courses={(data || []).map((row: any) => ({ id: row.course?.id, title: row.course?.title || "Course", category: row.course?.category?.name || "Uncategorized", students: 0, status: row.course?.status || "published" })).filter((row: any) => row.id)} /></DashboardShell>;
}
