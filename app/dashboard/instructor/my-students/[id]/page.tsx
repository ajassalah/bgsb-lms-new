import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { StudentProfileView } from "@/components/student-profile-view";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function InstructorStudentView({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("instructor"),
    admin = createAdminClient(),
    { data: links } = await admin
      .from("course_instructors")
      .select("course_id")
      .eq("instructor_id", profile.id),
    courseIds = (links || []).map((x) => x.course_id);
  if (!courseIds.length) notFound();
  const { data: allowed } = await admin
    .from("enrollments")
    .select("id")
    .eq("student_id", params.id)
    .in("course_id", courseIds)
    .limit(1)
    .maybeSingle();
  if (!allowed) notFound();
  const [
    { data: student },
    { data: enrollments },
    { data: certificates },
    { data: liveAssignments },
  ] = await Promise.all([
    admin
      .from("profiles")
      .select(
        "full_name,email,phone,country,address,date_of_birth,gender,about,nic_passport,avatar_url",
      )
      .eq("id", params.id)
      .eq("role", "student")
      .single(),
    admin
      .from("enrollments")
      .select(
        "course:courses(id,title,thumbnail_url,course_modules(count),assignments(count),quizzes(count))",
      )
      .eq("student_id", params.id)
      .in("course_id", courseIds),
    admin
      .from("certificates")
      .select("id,certificate_url,issued_at,course:courses(title)")
      .eq("student_id", params.id)
      .in("course_id", courseIds),
    admin
      .from("live_session_students")
      .select(
        "session:live_sessions(id,title,thumbnail_url,description,meeting_url,scheduled_start,scheduled_end)",
      )
      .eq("student_id", params.id),
  ]);
  if (!student) notFound();
  return (
    <DashboardShell role="instructor" name={profile.full_name}>
      <StudentProfileView
        hidePayments
        student={student}
        courses={(enrollments || []).map((e: any) => ({
          id: e.course?.id,
          title: e.course?.title || "Course",
          thumbnail_url: e.course?.thumbnail_url || null,
          modules: e.course?.course_modules?.[0]?.count || 0,
          assignments: e.course?.assignments?.[0]?.count || 0,
          quizzes: e.course?.quizzes?.[0]?.count || 0,
        }))}
        certificates={(certificates || []).map((x: any) => ({
          id: x.id,
          course: x.course?.title || "Course",
          url: x.certificate_url,
          date: x.issued_at,
        }))}
        payments={[]}
        logins={[]}
        liveClasses={(liveAssignments || [])
          .map((x: any) => x.session)
          .filter(Boolean)
          .map((x: any) => ({
            id: x.id,
            title: x.title,
            thumbnail: x.thumbnail_url,
            description: x.description || "",
            link: x.meeting_url,
            scheduled_start: x.scheduled_start,
            scheduled_end: x.scheduled_end,
          }))}
      />
    </DashboardShell>
  );
}
