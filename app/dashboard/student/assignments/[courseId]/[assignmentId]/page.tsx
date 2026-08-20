import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { StudentAssignmentDetails } from "@/components/student-assignment-details";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AssignmentView({
  params,
}: {
  params: { courseId: string; assignmentId: string };
}) {
  const profile = await requireProfile("student"),
    admin = createAdminClient();
  const [
    { data: enrollment },
    { data: assignment },
    { data: submission },
    { data: attempts },
  ] = await Promise.all([
    admin
      .from("enrollments")
      .select("id")
      .eq("student_id", profile.id)
      .eq("course_id", params.courseId)
      .in("status", ["approved", "completed"])
      .maybeSingle(),
    admin
      .from("assignments")
      .select(
        "id,title,max_score,file_url,course:courses(title),module:course_modules(title,position)",
      )
      .eq("id", params.assignmentId)
      .eq("course_id", params.courseId)
      .maybeSingle(),
    admin
      .from("assignment_submissions")
      .select("file_url,description,submitted_at,score,feedback,review_status")
      .eq("assignment_id", params.assignmentId)
      .eq("student_id", profile.id)
      .maybeSingle(),
    admin
      .from("assignment_submission_attempts")
      .select("id,file_url,description,submitted_at,attempt_number")
      .eq("assignment_id", params.assignmentId)
      .eq("student_id", profile.id)
      .order("attempt_number"),
  ]);
  if (!enrollment || !assignment) notFound();
  const course = Array.isArray((assignment as any).course)
    ? (assignment as any).course[0]
    : (assignment as any).course;
  const module = Array.isArray((assignment as any).module)
    ? (assignment as any).module[0]
    : (assignment as any).module;
  return (
    <DashboardShell
      role="student"
      name={profile.full_name}
      email={profile.email}
      avatar={profile.avatar_url}
    >
      <StudentAssignmentDetails
        details={{
          assignmentId: assignment.id,
          courseId: params.courseId,
          courseName: course?.title || "Course",
          moduleNo: module?.position || null,
          moduleName: module?.title || null,
          assignmentName: assignment.title,
          marks: submission?.score ?? null,
          maxMarks: assignment.max_score || 100,
          submittedAt: submission?.submitted_at || null,
          reviewStatus: submission?.review_status || "not_submitted",
          feedback: submission?.feedback || null,
          description: submission?.description || null,
          fileUrl: submission?.file_url || null,
          assignmentFileUrl: assignment.file_url || null,
          attempts: (attempts || []).map((attempt) => ({
            id: attempt.id,
            fileUrl: attempt.file_url,
            description: attempt.description,
            submittedAt: attempt.submitted_at,
            attemptNumber: attempt.attempt_number,
          })),
        }}
      />
    </DashboardShell>
  );
}
