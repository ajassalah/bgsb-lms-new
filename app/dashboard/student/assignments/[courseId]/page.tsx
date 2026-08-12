import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { StudentAssignmentTable } from "@/components/student-assignment-management";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function StudentCourseAssignments({
  params,
}: {
  params: { courseId: string };
}) {
  const p = await requireProfile("student"),
    admin = createAdminClient(),
    { data: enrollment } = await admin
      .from("enrollments")
      .select("id")
      .eq("student_id", p.id)
      .eq("course_id", params.courseId)
      .in("status", ["approved", "completed"])
      .maybeSingle();
  if (!enrollment) notFound();
  const [{ data: course }, { data: assignments }, { data: submissions }] =
    await Promise.all([
      admin.from("courses").select("title").eq("id", params.courseId).single(),
      admin
        .from("assignments")
        .select("id,title,created_at,due_date,module:course_modules(position)")
        .eq("course_id", params.courseId)
        .order("due_date"),
      admin
        .from("assignment_submissions")
        .select("assignment_id,file_url,description,review_status,submitted_at")
        .eq("student_id", p.id),
    ]);
  if (!course) notFound();
  const submitted = new Map(
    (submissions || []).map((x: any) => [x.assignment_id, x]),
  );
  return (
    <DashboardShell
      role="student"
      name={p.full_name}
      email={p.email}
      avatar={p.avatar_url}
    >
      <StudentAssignmentTable
        courseId={params.courseId}
        courseTitle={course.title}
        assignments={(assignments || []).map((a: any) => {
          const s = submitted.get(a.id) as any,
            module = Array.isArray(a.module) ? a.module[0] : a.module;
          return {
            id: a.id,
            moduleNo: module?.position || null,
            title: a.title,
            start: a.created_at,
            due: a.due_date,
            submittedAt: s?.submitted_at || null,
            status: s?.review_status || "not_submitted",
            fileUrl: s?.file_url || null,
            description: s?.description || null,
          };
        })}
      />
    </DashboardShell>
  );
}
