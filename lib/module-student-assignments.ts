import { createAdminClient } from "@/lib/supabase/admin";

export async function loadModuleStudentAssignments(
  courseId: string,
  moduleId: string,
  studentId: string,
) {
  const admin = createAdminClient(),
    [
      { data: course },
      { data: module },
      { data: student },
      { data: enrollment },
      { data: assignments },
      { data: submissions },
    ] = await Promise.all([
      admin.from("courses").select("title").eq("id", courseId).maybeSingle(),
      admin
        .from("course_modules")
        .select("title")
        .eq("id", moduleId)
        .eq("course_id", courseId)
        .maybeSingle(),
      admin
        .from("profiles")
        .select("full_name")
        .eq("id", studentId)
        .eq("role", "student")
        .maybeSingle(),
      admin
        .from("enrollments")
        .select("id")
        .eq("course_id", courseId)
        .eq("student_id", studentId)
        .in("status", ["approved", "completed"])
        .maybeSingle(),
      admin
        .from("assignments")
        .select("id,title,created_at,due_date,max_score")
        .eq("course_id", courseId)
        .eq("module_id", moduleId)
        .order("due_date"),
      admin
        .from("assignment_submissions")
        .select(
          "assignment_id,file_url,description,review_status,score,feedback,submitted_at",
        )
        .eq("student_id", studentId),
    ]);
  if (!course || !module || !student || !enrollment) return null;
  const submitted = new Map(
    (submissions || []).map((row: any) => [row.assignment_id, row]),
  );
  return {
    courseTitle: course.title,
    moduleTitle: module.title,
    studentName: student.full_name,
    rows: (assignments || []).map((row: any) => {
      const submission = submitted.get(row.id) as any;
      return {
        id: row.id,
        title: row.title,
        start: row.created_at,
        deadline: row.due_date,
        marks: row.max_score,
        scoredMarks: submission?.score ?? null,
        status: submission?.review_status || "not_submitted",
        submissionStatus: submission?.submitted_at
          ? "Submitted"
          : "Not Submitted",
        feedback: submission?.feedback || null,
        description: submission?.description || null,
        fileUrl: submission?.file_url || null,
      };
    }),
  };
}
