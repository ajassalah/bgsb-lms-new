import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { LiveClassManagement } from "@/components/live-class-management";
export default async function LiveClasses() {
  const profile = await requireProfile("super_admin"),
    db = createClient(),
    [
      { data },
      { data: instructors },
      { data: courses },
      { data: enrollments },
      { data: staff },
    ] = await Promise.all([
      db
        .from("live_sessions")
        .select(
          "id,title,description,meeting_url,thumbnail_url,course_id,live_session_instructors(instructor_id,instructor:profiles!live_session_instructors_instructor_id_fkey(full_name)),live_session_staff(staff_id,staff:profiles!live_session_staff_staff_id_fkey(full_name)),live_session_courses(course_id),live_session_students(student_id)",
        )
        .order("scheduled_start", { ascending: false }),
      db
        .from("profiles")
        .select("id,full_name")
        .eq("role", "instructor")
        .eq("status", "active")
        .order("full_name"),
      db
        .from("courses")
        .select("id,title,instructor_id")
        .neq("status", "archived")
        .order("title"),
      db
        .from("enrollments")
        .select(
          "course_id,student_id,student:profiles!enrollments_student_id_fkey(full_name,email)",
        )
        .eq("status", "active"),
      db
        .from("profiles")
        .select("id,full_name,email")
        .eq("role", "admin_staff")
        .eq("status", "active")
        .order("full_name"),
    ]);
  return (
    <SuperAdminShell name={profile.full_name}>
      <LiveClassManagement
        instructors={(instructors || []).map((x) => ({
          id: x.id,
          name: x.full_name,
        }))}
        staff={(staff || []).map((x) => ({
          id: x.id,
          name: x.full_name,
          detail: x.email,
        }))}
        courses={(courses || []).map((x) => ({
          id: x.id,
          name: x.title,
          instructorId: x.instructor_id,
        }))}
        students={(enrollments || []).map((x: any) => ({
          id: x.student_id,
          name: x.student?.full_name || x.student?.email || "Student",
          email: x.student?.email || "",
          courseId: x.course_id,
        }))}
        initialRows={(data || []).map((x) => ({
          ...x,
          description: x.description || "",
          meeting_url: x.meeting_url || "",
          thumbnail_url: x.thumbnail_url || "",
          instructor_ids: (x.live_session_instructors || []).map(
            (assignment: any) => assignment.instructor_id,
          ),
          instructor_names: (x.live_session_instructors || [])
            .map((assignment: any) => assignment.instructor?.full_name)
            .filter(Boolean),
          course_ids: (x.live_session_courses || []).length
            ? (x.live_session_courses || []).map(
                (assignment: any) => assignment.course_id,
              )
            : x.course_id
              ? [x.course_id]
              : [],
          student_ids: (x.live_session_students || []).map(
            (assignment: any) => assignment.student_id,
          ),
          staff_ids: (x.live_session_staff || []).map(
            (assignment: any) => assignment.staff_id,
          ),
          staff_names: (x.live_session_staff || [])
            .map((assignment: any) => assignment.staff?.full_name)
            .filter(Boolean),
        }))}
      />
    </SuperAdminShell>
  );
}
