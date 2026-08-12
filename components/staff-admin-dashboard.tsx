import { SuperAdminHome } from "./super-admin-home";
import { createAdminClient } from "@/lib/supabase/admin";

export async function StaffAdminDashboard({
  profile,
  showRecentActivity,
}: {
  profile: { id: string; full_name: string; avatar_url: string | null };
  showRecentActivity: boolean;
}) {
  const db = createAdminClient();
  const q = await Promise.all([
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
      .order("scheduled_start")
      .limit(200),
    db
      .from("calendar_appointments")
      .select("id,title,scheduled_start,scheduled_end")
      .order("scheduled_start")
      .limit(200),
    db.from("profiles").select("created_at").eq("role", "student"),
    db.from("profiles").select("created_at").eq("role", "instructor"),
    db.from("courses").select("created_at").eq("status", "published"),
    db
      .from("admin_activity_logs")
      .select(
        "id,description,created_at,actor:profiles!admin_activity_logs_actor_id_fkey(full_name,avatar_url)",
      )
      .order("created_at", { ascending: false })
      .limit(4),
    db
      .from("profiles")
      .select("staff_role,staff_welcome_seen")
      .eq("id", profile.id)
      .single(),
  ]);
  const sessions = q[9].data || [],
    calendar = q[10].data || [];
  return (
    <SuperAdminHome
      basePath="/dashboard/admin-staff"
      dashboardTitle="Staff Dashboard"
      showRecentActivity={showRecentActivity}
      counts={{
        students: q[0].count || 0,
        instructors: q[1].count || 0,
        courses: q[2].count || 0,
        organizations: q[3].count || 0,
        enrollments: q[4].count || 0,
        completed: q[5].count || 0,
      }}
      bestCourses={(q[6].data || [])
        .map((x: any) => ({
          title: x.title,
          enrollments: x.enrollments?.[0]?.count || 0,
        }))
        .sort((a, b) => b.enrollments - a.enrollments)
        .slice(0, 5)}
      manpower={{ users: q[7].count || 0, admins: q[8].count || 0 }}
      movement={{
        students: (q[11].data || []).map((x) => x.created_at),
        instructors: (q[12].data || []).map((x) => x.created_at),
        courses: (q[13].data || []).map((x) => x.created_at),
      }}
      recentActivity={(q[14].data || []).map((x: any) => ({
        id: x.id,
        name: x.actor?.full_name || "User",
        avatar: x.actor?.avatar_url || null,
        event: x.description || "Activity",
        date: x.created_at,
      }))}
      upcomingSessions={sessions
        .filter((x) => new Date(x.scheduled_start) >= new Date())
        .slice(0, 5)
        .map((x) => ({
          id: x.id,
          title: x.title,
          start: x.scheduled_start,
          meetingUrl: x.meeting_url || null,
        }))}
      admin={{ name: profile.full_name, avatarUrl: profile.avatar_url }}
      appointments={[
        ...sessions.map((x) => ({
          id: `class-${x.id}`,
          title: x.title,
          start: x.scheduled_start,
          end: x.scheduled_end,
          status: x.status,
          meetingUrl: x.meeting_url || null,
        })),
        ...calendar.map((x) => ({
          id: `appointment-${x.id}`,
          title: x.title,
          start: x.scheduled_start,
          end: x.scheduled_end || x.scheduled_start,
          status: "appointment",
          meetingUrl: null,
        })),
      ]}
      staffWelcome={{
        show: q[15].data?.staff_welcome_seen === false,
        role: q[15].data?.staff_role || "Staff",
      }}
    />
  );
}
