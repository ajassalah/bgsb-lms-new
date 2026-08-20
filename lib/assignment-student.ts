import { createAdminClient } from "@/lib/supabase/admin";

export async function loadAssignmentStudent(
  courseId: string,
  studentId: string,
) {
  const admin = createAdminClient();
  const [
    { data: course },
    { data: student },
    { data: enrollment },
    { data: modules },
    { data: submissions },
  ] = await Promise.all([
    admin
      .from("courses")
      .select("title,thumbnail_url")
      .eq("id", courseId)
      .maybeSingle(),
    admin
      .from("profiles")
      .select("full_name,email,avatar_url")
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
      .from("course_modules")
      .select("id,title,position")
      .eq("course_id", courseId)
      .order("position"),
    admin
      .from("assignment_submissions")
      .select(
        "id,file_url,submitted_at,score,grade,description,review_status,assignment:assignments!assignment_submissions_assignment_id_fkey(id,title,module_id,max_score,course_id)",
      )
      .eq("student_id", studentId),
  ]);
  if (!course || !student || !enrollment) return null;
  const valid = (submissions || []).filter(
    (x: any) => x.assignment?.course_id === courseId,
  );
  return {
    course: { title: course.title, thumbnailUrl: course.thumbnail_url },
    student: {
      name: student.full_name,
      email: student.email,
      avatar: student.avatar_url,
    },
    modules: (modules || []).map((module: any) => ({
      ...module,
      submissions: valid
        .filter((x: any) => x.assignment?.module_id === module.id)
        .map((x: any) => ({
          id: x.id,
          assignmentId: x.assignment?.id,
          title: x.assignment?.title || "Assignment",
          fileUrl: x.file_url
            ? `${x.file_url}${x.file_url.includes("?") ? "&" : "?"}download=${encodeURIComponent(downloadName(x.assignment?.title || "assignment", x.file_url))}`
            : null,
          submittedAt: x.submitted_at,
          score: x.score,
          grade: x.grade,
          maxScore: x.assignment?.max_score || 100,
          description: x.description,
          reviewStatus: x.review_status || "submitted",
        })),
    })),
  };
}

function downloadName(title: string, url: string) {
  const clean = url.split("?")[0],
    extension = clean.match(/\.([a-z0-9]{1,10})$/i)?.[1],
    safe = title.replace(/[^a-z0-9 _-]/gi, "").trim() || "assignment";
  return extension ? `${safe}.${extension}` : safe;
}
