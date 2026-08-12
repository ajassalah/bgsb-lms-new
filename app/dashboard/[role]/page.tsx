import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { roles, type Role } from "@/lib/types";
import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardHome } from "@/components/dashboard-home";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { SuperAdminHome } from "@/components/super-admin-home";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { InstructorDashboard } from "@/components/instructor-dashboard";
import { StudentDashboard } from "@/components/student-dashboard";
import { StaffAdminDashboard } from "@/components/staff-admin-dashboard";
import { StaffPortalShell } from "@/components/staff-portal-shell";
export default async function Dashboard({
  params,
}: {
  params: { role: string };
}) {
  const role = params.role.replace("-", "_") as Role;
  if (!roles.includes(role)) notFound();
  const p = await requireProfile(role);
  if (role === "super_admin") {
    const db = createClient();
    const queries = await Promise.all([
      db
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student"),
      db
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "instructor"),
      db
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("status", "published"),
      db.from("organizations").select("*", { count: "exact", head: true }),
      db.from("enrollments").select("*", { count: "exact", head: true }),
      db
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .or("status.eq.completed,progress_percent.eq.100"),
      db.from("courses").select("id,title,enrollments(count)"),
      db.from("profiles").select("*", { count: "exact", head: true }),
      db
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .in("role", ["super_admin", "admin_staff"]),
      db
        .from("live_sessions")
        .select("id,title,scheduled_start,scheduled_end,status,meeting_url")
        .order("scheduled_start", { ascending: true })
        .limit(200),
      db
        .from("calendar_appointments")
        .select("id,title,scheduled_start,scheduled_end")
        .order("scheduled_start", { ascending: true })
        .limit(200),
      db.from("profiles").select("created_at").eq("role", "student"),
      db.from("profiles").select("created_at").eq("role", "instructor"),
      db.from("courses").select("created_at").eq("status", "published"),
      db
        .from("admin_activity_logs")
        .select(
          "id,description,created_at,actor:profiles!admin_activity_logs_actor_id_fkey(full_name,avatar_url)",
        )
        .eq("action", "login")
        .order("created_at", { ascending: false })
        .limit(4),
    ]);
    const counts = {
      students: queries[0].count || 0,
      instructors: queries[1].count || 0,
      courses: queries[2].count || 0,
      organizations: queries[3].count || 0,
      enrollments: queries[4].count || 0,
      completed: queries[5].count || 0,
    };
    const bestCourses = (queries[6].data || [])
      .map((course: any) => ({
        title: course.title,
        enrollments: course.enrollments?.[0]?.count || 0,
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);
    const manpower = {
      users: queries[7].count || 0,
      admins: queries[8].count || 0,
    };
    return (
      <SuperAdminShell name={p.full_name}>
        <SuperAdminHome
          counts={counts}
          bestCourses={bestCourses}
          manpower={manpower}
          movement={{
            students: (queries[11].data || []).map((x) => x.created_at),
            instructors: (queries[12].data || []).map((x) => x.created_at),
            courses: (queries[13].data || []).map((x) => x.created_at),
          }}
          recentActivity={(queries[14].data || []).map((item: any) => ({
            id: item.id,
            name: item.actor?.full_name || "User",
            avatar: item.actor?.avatar_url || null,
            event: item.description || "Logged in",
            date: item.created_at,
          }))}
          upcomingSessions={(queries[9].data || [])
            .filter((item) => new Date(item.scheduled_start) >= new Date())
            .slice(0, 5)
            .map((item) => ({
              id: item.id,
              title: item.title,
              start: item.scheduled_start,
              meetingUrl: item.meeting_url || null,
            }))}
          admin={{ name: p.full_name, avatarUrl: p.avatar_url || null }}
          appointments={[
            ...(queries[9].data || []).map((session) => ({
              id: `class-${session.id}`,
              title: session.title,
              start: session.scheduled_start,
              end: session.scheduled_end,
              status: session.status,
              meetingUrl: session.meeting_url || null,
            })),
            ...(queries[10].data || []).map((appointment) => ({
              id: `appointment-${appointment.id}`,
              title: appointment.title,
              start: appointment.scheduled_start,
              end: appointment.scheduled_end || appointment.scheduled_start,
              status: "appointment",
              meetingUrl: null,
            })),
          ]}
        />
      </SuperAdminShell>
    );
  }
  if (role === "instructor") {
    const admin = createAdminClient();
    const [
      { data: links },
      { data: sessionLinks },
      { data: directSessions },
      publishedResult,
      { data: welcomeProfile },
    ] = await Promise.all([
      admin
        .from("course_instructors")
        .select("course_id")
        .eq("instructor_id", p.id),
      admin
        .from("live_session_instructors")
        .select("session_id")
        .eq("instructor_id", p.id),
      admin.from("live_sessions").select("id").eq("instructor_id", p.id),
      admin
        .from("courses")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      admin
        .from("profiles")
        .select("instructor_welcome_seen")
        .eq("id", p.id)
        .single(),
    ]);
    const courseIds = (links || []).map((item) => item.course_id);
    const sessionIds = Array.from(
      new Set([
        ...(sessionLinks || []).map((item) => item.session_id),
        ...(directSessions || []).map((item) => item.id),
      ]),
    );
    const [{ data: courses }, { data: enrollments }, { data: sessions }] =
      await Promise.all([
        courseIds.length
          ? admin
              .from("courses")
              .select("id,title,status,enrollments(count)")
              .in("id", courseIds)
          : Promise.resolve({ data: [] }),
        courseIds.length
          ? admin
              .from("enrollments")
              .select("student_id")
              .in("course_id", courseIds)
          : Promise.resolve({ data: [] }),
        sessionIds.length
          ? admin
              .from("live_sessions")
              .select("id,title,scheduled_start,meeting_url")
              .in("id", sessionIds)
              .order("scheduled_start")
          : Promise.resolve({ data: [] }),
      ]);
    const bestCourses = (courses || [])
      .map((course: any) => ({
        title: course.title,
        enrollments: course.enrollments?.[0]?.count || 0,
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);
    return (
      <DashboardShell role="instructor" name={p.full_name}>
        <InstructorDashboard
          name={p.full_name}
          avatar={p.avatar_url || null}
          counts={{
            students: new Set(
              (enrollments || []).map((item) => item.student_id),
            ).size,
            assignedCourses: courseIds.length,
            publishedCourses: publishedResult.count || 0,
            liveSessions: sessionIds.length,
          }}
          bestCourses={bestCourses}
          sessions={(sessions || []).map((session) => ({
            id: session.id,
            title: session.title,
            start: session.scheduled_start,
            meetingUrl: session.meeting_url || null,
          }))}
          showWelcome={welcomeProfile?.instructor_welcome_seen === false}
        />
      </DashboardShell>
    );
  }
  if (role === "student") {
    const admin = createAdminClient();
    const [
      { data: enrollments },
      { data: sessionLinks },
      { data: submissions },
      { data: welcomeProfile },
    ] = await Promise.all([
      admin
        .from("enrollments")
        .select(
          "course_id,progress_percent,course:courses(id,title,status,enrollments(count))",
        )
        .eq("student_id", p.id)
        .in("status", ["approved", "completed"]),
      admin
        .from("live_session_students")
        .select(
          "session_id,session:live_sessions(id,title,scheduled_start,meeting_url)",
        )
        .eq("student_id", p.id),
      admin
        .from("assignment_submissions")
        .select("assignment_id")
        .eq("student_id", p.id),
      admin
        .from("profiles")
        .select("student_welcome_seen")
        .eq("id", p.id)
        .single(),
    ]);
    const courseIds = (enrollments || []).map((row) => row.course_id),
      submitted = new Set((submissions || []).map((row) => row.assignment_id));
    const { data: assignments } = courseIds.length
      ? await admin
          .from("assignments")
          .select("id,due_date")
          .in("course_id", courseIds)
      : { data: [] };
    const sessions = (sessionLinks || [])
      .map((row: any) => row.session)
      .filter((row: any) => row && new Date(row.scheduled_start) >= new Date())
      .sort(
        (a: any, b: any) =>
          +new Date(a.scheduled_start) - +new Date(b.scheduled_start),
      );
    return (
      <DashboardShell
        role="student"
        name={p.full_name}
        email={p.email}
        avatar={p.avatar_url}
      >
        <StudentDashboard
          name={p.full_name}
          avatar={p.avatar_url}
          counts={{
            courses: courseIds.length,
            due: (assignments || []).filter(
              (item) =>
                !submitted.has(item.id) &&
                new Date(item.due_date) >= new Date(),
            ).length,
            meetings: (sessionLinks || []).length,
          }}
          bestCourses={(enrollments || [])
            .map((row: any) => ({
              title: row.course?.title || "Course",
              enrollments: row.course?.enrollments?.[0]?.count || 0,
            }))
            .sort((a: any, b: any) => b.enrollments - a.enrollments)
            .slice(0, 5)}
          sessions={sessions.map((row: any) => ({
            id: row.id,
            title: row.title,
            start: row.scheduled_start,
            meetingUrl: row.meeting_url,
          }))}
          showWelcome={welcomeProfile?.student_welcome_seen === false}
          welcomeCourse={
            (enrollments?.[0] as any)?.course?.title || "your programme"
          }
        />
      </DashboardShell>
    );
  }
  if (role === "admin_staff") {
    const admin = createAdminClient();
    const [{ data: staff }, { data: permissionRows }] = await Promise.all([
      admin.from("profiles").select("staff_role").eq("id", p.id).single(),
      admin
        .from("admin_permissions")
        .select("module,actions")
        .eq("admin_staff_id", p.id),
    ]);
    const permissions = Object.fromEntries(
      (permissionRows || []).map((row) => [row.module, row.actions || {}]),
    );
    return (
      <StaffPortalShell
        name={p.full_name}
        roleName={staff?.staff_role || "Staff"}
        permissions={permissions}
      >
        <StaffAdminDashboard
          profile={{
            id: p.id,
            full_name: p.full_name,
            avatar_url: p.avatar_url,
          }}
          showRecentActivity={!!permissions.recent_activities?.access}
        />
      </StaffPortalShell>
    );
  }
  return (
    <DashboardShell
      role={role}
      name={p.full_name}
      email={p.email}
      avatar={p.avatar_url}
    >
      <DashboardHome role={role} name={p.full_name} />
    </DashboardShell>
  );
}
