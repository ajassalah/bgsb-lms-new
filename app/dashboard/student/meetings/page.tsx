import { DashboardShell } from "@/components/dashboard-shell";
import { InstructorLiveClasses } from "@/components/instructor-portal-pages";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function StudentMeetings() {
  const profile = await requireProfile("student"),
    db = createAdminClient(),
    { data: enrollments } = await db
      .from("enrollments")
      .select("course_id")
      .eq("student_id", profile.id)
      .in("status", ["approved", "completed"]),
    courseIds = (enrollments || []).map((row) => row.course_id),
    [{ data: direct }, { data: courseLinks }] = await Promise.all([
      db
        .from("live_session_students")
        .select(
          "session:live_sessions(id,title,description,thumbnail_url,scheduled_start,scheduled_end,meeting_url)",
        )
        .eq("student_id", profile.id),
      courseIds.length
        ? db
            .from("live_session_courses")
            .select(
              "session:live_sessions(id,title,description,thumbnail_url,scheduled_start,scheduled_end,meeting_url)",
            )
            .in("course_id", courseIds)
        : Promise.resolve({ data: [] as any[] }),
    ]),
    sessions = [...(direct || []), ...(courseLinks || [])]
      .map((row: any) => row.session)
      .filter(Boolean)
      .filter(
        (session: any, index: number, all: any[]) =>
          all.findIndex((item) => item.id === session.id) === index,
      );
  return (
    <DashboardShell
      role="student"
      name={profile.full_name}
      email={profile.email}
      avatar={profile.avatar_url}
    >
      <InstructorLiveClasses
        rows={sessions.map((session: any) => ({
          id: session.id,
          title: session.title,
          description: session.description || "",
          thumbnail: session.thumbnail_url,
          start: session.scheduled_start,
          end: session.scheduled_end,
          url: session.meeting_url,
        }))}
      />
    </DashboardShell>
  );
}
