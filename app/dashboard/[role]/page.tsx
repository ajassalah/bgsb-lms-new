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
