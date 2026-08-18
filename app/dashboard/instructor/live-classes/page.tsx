import { DashboardShell } from "@/components/dashboard-shell";
import { LiveClassManagement } from "@/components/live-class-management";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function InstructorLiveClassesPage() {
  const profile = await requireProfile("instructor"),
    db = createAdminClient(),
    { data: assignedCourses } = await db
      .from("course_instructors")
      .select(
        "course_id,course:courses(id,title,status,instructor_id,course_instructors(instructor_id))",
      )
      .eq("instructor_id", profile.id),
    courses = (assignedCourses || [])
      .map((row: any) => row.course)
      .filter(Boolean),
    courseIds = courses.map((course: any) => course.id),
    [
      { data: links },
      { data: direct },
      { data: instructors },
      { data: staff },
      { data: enrollments },
    ] = await Promise.all([
      db
        .from("live_session_instructors")
        .select("session_id")
        .eq("instructor_id", profile.id),
      db.from("live_sessions").select("id").eq("instructor_id", profile.id),
      db
        .from("profiles")
        .select("id,full_name")
        .eq("role", "instructor")
        .eq("status", "active")
        .order("full_name"),
      db
        .from("profiles")
        .select("id,full_name,email")
        .eq("role", "admin_staff")
        .eq("status", "active")
        .order("full_name"),
      courseIds.length
        ? db
            .from("enrollments")
            .select(
              "course_id,student_id,student:profiles!enrollments_student_id_fkey(full_name,email)",
            )
            .in("course_id", courseIds)
            .in("status", ["approved", "completed"])
        : Promise.resolve({ data: [] as any[] }),
    ]),
    sessionIds = Array.from(
      new Set([
        ...(links || []).map((row) => row.session_id),
        ...(direct || []).map((row) => row.id),
      ]),
    ),
    { data } = sessionIds.length
      ? await db
          .from("live_sessions")
          .select(
            "id,title,description,meeting_url,thumbnail_url,course_id,scheduled_start,scheduled_end,live_session_instructors(instructor_id,instructor:profiles!live_session_instructors_instructor_id_fkey(full_name)),live_session_staff(staff_id,staff:profiles!live_session_staff_staff_id_fkey(full_name)),live_session_courses(course_id),live_session_students(student_id)",
          )
          .in("id", sessionIds)
          .order("scheduled_start", { ascending: false })
      : { data: [] };
  return (
    <DashboardShell
      role="instructor"
      name={profile.full_name}
      email={profile.email}
      avatar={profile.avatar_url}
    >
      <LiveClassManagement
        canManageExisting={false}
        allowAllInstructors
        instructors={(instructors || []).map((row) => ({
          id: row.id,
          name: row.full_name,
        }))}
        staff={(staff || []).map((row) => ({
          id: row.id,
          name: row.full_name,
          detail: row.email,
        }))}
        courses={courses.map((course: any) => ({
          id: course.id,
          name: course.title,
          instructorIds: Array.from(
            new Set([
              ...(course.course_instructors || []).map(
                (row: any) => row.instructor_id,
              ),
              ...(course.instructor_id ? [course.instructor_id] : []),
            ]),
          ),
        }))}
        students={(enrollments || []).map((row: any) => ({
          id: row.student_id,
          name: row.student?.full_name || row.student?.email || "Student",
          email: row.student?.email || "",
          courseId: row.course_id,
        }))}
        initialRows={(data || []).map((row: any) => ({
          ...row,
          description: row.description || "",
          meeting_url: row.meeting_url || "",
          thumbnail_url: row.thumbnail_url || "",
          instructor_ids: (row.live_session_instructors || []).map(
            (item: any) => item.instructor_id,
          ),
          instructor_names: (row.live_session_instructors || [])
            .map((item: any) => item.instructor?.full_name)
            .filter(Boolean),
          course_ids: (row.live_session_courses || []).length
            ? row.live_session_courses.map((item: any) => item.course_id)
            : row.course_id
              ? [row.course_id]
              : [],
          student_ids: (row.live_session_students || []).map(
            (item: any) => item.student_id,
          ),
          staff_ids: (row.live_session_staff || []).map(
            (item: any) => item.staff_id,
          ),
          staff_names: (row.live_session_staff || [])
            .map((item: any) => item.staff?.full_name)
            .filter(Boolean),
        }))}
      />
    </DashboardShell>
  );
}
