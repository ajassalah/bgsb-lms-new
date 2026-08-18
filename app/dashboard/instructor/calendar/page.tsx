import { DashboardShell } from "@/components/dashboard-shell";
import { CalendarManagement } from "@/components/calendar-management";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function Page({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const p = await requireProfile("instructor"),
    db = createAdminClient(),
    [
      { data: links },
      { data: direct },
      { data: ownedAppointments },
      { data: appointmentLinks },
    ] = await Promise.all([
      db
        .from("live_session_instructors")
        .select("session_id")
        .eq("instructor_id", p.id),
      db.from("live_sessions").select("id").eq("instructor_id", p.id),
      db
        .from("calendar_appointments")
        .select("id,title,description,scheduled_start,scheduled_end,created_by")
        .eq("created_by", p.id)
        .order("scheduled_start"),
      db
        .from("calendar_appointment_users")
        .select(
          "appointment:calendar_appointments(id,title,description,scheduled_start,scheduled_end,created_by)",
        )
        .eq("user_id", p.id),
    ]),
    ids = Array.from(
      new Set([
        ...(links || []).map((x) => x.session_id),
        ...(direct || []).map((x) => x.id),
      ]),
    ),
    { data: sessions } = ids.length
      ? await db
          .from("live_sessions")
          .select(
            "id,title,description,scheduled_start,scheduled_end,meeting_url",
          )
          .in("id", ids)
          .order("scheduled_start")
      : { data: [] },
    events = [
      ...[
        ...(ownedAppointments || []),
        ...(appointmentLinks || [])
          .map((x: any) => x.appointment)
          .filter(Boolean),
      ]
        .filter((x: any, i, a) => a.findIndex((y: any) => y.id === x.id) === i)
        .map((x: any) => ({
          ...x,
          id: `appointment-${x.id}`,
          source: "appointment" as const,
          editable: x.created_by === p.id,
        })),
      ...(sessions || []).map((x) => ({
        ...x,
        id: `class-${x.id}`,
        source: "live_class" as const,
        editable: false,
      })),
    ].sort(
      (a, b) => +new Date(a.scheduled_start) - +new Date(b.scheduled_start),
    );
  const { data: courseLinks } = await db
    .from("course_instructors")
    .select("course_id")
    .eq("instructor_id", p.id);
  const courseIds = (courseLinks || []).map((row) => row.course_id);
  const [
    { data: relatedInstructors },
    { data: relatedStudents },
    { data: users },
  ] = await Promise.all([
    courseIds.length
      ? db
          .from("course_instructors")
          .select("instructor_id")
          .in("course_id", courseIds)
      : Promise.resolve({ data: [] as any[] }),
    courseIds.length
      ? db
          .from("enrollments")
          .select("student_id")
          .in("course_id", courseIds)
          .in("status", ["approved", "completed"])
      : Promise.resolve({ data: [] as any[] }),
    db
      .from("profiles")
      .select("id,full_name,role,avatar_url")
      .in("role", ["instructor", "student", "admin_staff"])
      .eq("status", "active")
      .order("full_name"),
  ]);
  const relatedInstructorIds = new Set(
      (relatedInstructors || []).map((row) => row.instructor_id),
    ),
    relatedStudentIds = new Set(
      (relatedStudents || []).map((row) => row.student_id),
    );
  return (
    <DashboardShell role="instructor" name={p.full_name}>
      <CalendarManagement
        initialAppointments={events}
        assignableUsers={(users || [])
          .filter(
            (user) =>
              user.role === "admin_staff" ||
              (user.role === "instructor" &&
                relatedInstructorIds.has(user.id)) ||
              (user.role === "student" && relatedStudentIds.has(user.id)),
          )
          .map((user) => ({
            id: user.id,
            name: user.full_name,
            role: user.role,
            avatar: user.avatar_url,
          }))}
        initialSelected={
          /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date || "")
            ? searchParams.date
            : undefined
        }
      />
    </DashboardShell>
  );
}
