import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { roles, type Role } from "@/lib/types";
import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardHome } from "@/components/dashboard-home";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { SuperAdminHome } from "@/components/super-admin-home";
import { createClient } from "@/lib/supabase/server";
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
        .eq("status", "completed"),
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
  return (
    <DashboardShell role={role} name={p.full_name}>
      <DashboardHome role={role} />
    </DashboardShell>
  );
}
