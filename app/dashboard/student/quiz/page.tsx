import { DashboardShell } from "@/components/dashboard-shell";
import { ReadOnlyTable } from "@/components/instructor-portal-pages";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StudentQuiz() {
  const profile = await requireProfile("student");
  const admin = createAdminClient();
  const { data: enrollments } = await admin
    .from("enrollments")
    .select("course_id")
    .eq("student_id", profile.id)
    .in("status", ["approved", "completed"]);
  const courseIds = Array.from(
    new Set((enrollments || []).map((item) => item.course_id)),
  );
  const { data: courses } = courseIds.length
    ? await admin
        .from("courses")
        .select("id,title")
        .in("id", courseIds)
        .order("title")
    : { data: [] };

  return (
    <DashboardShell
      role="student"
      name={profile.full_name}
      email={profile.email}
      avatar={profile.avatar_url}
    >
      <ReadOnlyTable
        title="Quiz"
        portalLabel="Student Portal"
        directView
        columns={["My Course"]}
        rows={(courses || []).map((course: any) => ({
          id: course.id,
          cells: [course.title || "Course"],
          view: `/dashboard/student/quiz/${course.id}`,
        }))}
      />
    </DashboardShell>
  );
}
