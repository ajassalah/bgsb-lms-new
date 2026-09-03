import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { StudentProfileView } from "@/components/student-profile-view";
export default async function StudentView({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("admin_staff"),
    db = createAdminClient();
  const [
    { data: student },
    { data: enrollments },
    { data: certificates },
    { data: payments },
    { data: logins },
    { data: liveAssignments },
  ] = await Promise.all([
    db
      .from("profiles")
      .select(
        "full_name,email,phone,country,address,date_of_birth,gender,about,nic_passport,avatar_url",
      )
      .eq("id", params.id)
      .eq("role", "student")
      .single(),
    db
      .from("enrollments")
      .select(
        "course:courses(id,title,thumbnail_url,course_modules(count),assignments(count),quizzes(count)),batch:batches(batch_name)",
      )
      .eq("student_id", params.id),
    db
      .from("certificates")
      .select("id,certificate_url,issued_at,course:courses(title)")
      .eq("student_id", params.id)
      .order("issued_at", { ascending: false }),
    db
      .from("student_payments")
      .select("id,title,payment_method,amount,paid_at")
      .eq("student_id", params.id)
      .order("paid_at", { ascending: false }),
    db
      .from("student_login_history")
      .select("id,browser,platform,ip_address,logged_at")
      .eq("student_id", params.id)
      .order("logged_at", { ascending: false }),
    db
      .from("live_session_students")
      .select(
        "session:live_sessions(id,title,thumbnail_url,description,meeting_url,scheduled_start,scheduled_end)",
      )
      .eq("student_id", params.id),
  ]);
  if (!student) notFound();
  const courses = (enrollments || []).map((e: any) => ({
    id: e.course?.id,
    title: e.course?.title || "Course",
    thumbnail_url: e.course?.thumbnail_url || null,
    modules: e.course?.course_modules?.[0]?.count || 0,
    assignments: e.course?.assignments?.[0]?.count || 0,
    quizzes: e.course?.quizzes?.[0]?.count || 0,
    batch: e.batch?.batch_name || null,
  }));
  return (
    <StaffPageShell name={profile.full_name}>
      <StudentProfileView
        student={student}
        courses={courses}
        certificates={(certificates || []).map((x: any) => ({
          id: x.id,
          course: x.course?.title || "Course",
          url: x.certificate_url,
          date: x.issued_at,
        }))}
        payments={(payments || []).map((x) => ({
          id: x.id,
          title: x.title,
          method: x.payment_method,
          date: x.paid_at,
          amount: Number(x.amount),
        }))}
        logins={(logins || []).map((x) => ({
          id: x.id,
          browser: x.browser || "Unknown",
          platform: x.platform || "Unknown",
          ip: x.ip_address || "â€”",
          date: x.logged_at,
        }))}
        liveClasses={(liveAssignments || [])
          .map((assignment: any) => assignment.session)
          .filter(Boolean)
          .map((session: any) => ({
            id: session.id,
            title: session.title,
            thumbnail: session.thumbnail_url,
            description: session.description || "",
            link: session.meeting_url,
            scheduled_start: session.scheduled_start,
            scheduled_end: session.scheduled_end,
          }))}
      />
    </StaffPageShell>
  );
}
