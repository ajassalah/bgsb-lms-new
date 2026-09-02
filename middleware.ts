import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const staffRouteModules: [string, string[]][] = [
  ["/dashboard/admin-staff/class/attendance", ["class_attendance"]],
  ["/dashboard/admin-staff/class/students", ["class_students"]],
  ["/dashboard/admin-staff/class/instructors", ["class_instructors"]],
  ["/dashboard/admin-staff/class/classes", ["class_management"]],
  ["/dashboard/admin-staff/class/reports", ["class_reports"]],
  ["/dashboard/admin-staff/class", ["class_dashboard"]],
  ["/dashboard/admin-staff/enrollments", ["enrollment"]],
  ["/dashboard/admin-staff/category", ["categories"]],
  ["/dashboard/admin-staff/curriculum", ["curriculum_overview"]],
  [
    "/dashboard/admin-staff/certificates",
    ["certificates", "certificate_students"],
  ],
  [
    "/dashboard/admin-staff/courses",
    ["courses", "curriculum", "curriculum_overview", "curriculum_assignments"],
  ],
  ["/dashboard/admin-staff/live-classes", ["live_classes"]],
  [
    "/dashboard/admin-staff/assignments",
    [
      "assignments",
      "assignment_tab",
      "assignment_students",
      "assignment_student_modules",
      "submitted_assignments",
    ],
  ],
  ["/dashboard/admin-staff/students", ["students"]],
  ["/dashboard/admin-staff/instructors", ["instructors"]],
  ["/dashboard/admin-staff/roles", ["roles"]],
  ["/dashboard/admin-staff/staff", ["staff"]],
  ["/dashboard/admin-staff/announcements", ["announcements"]],
  ["/dashboard/admin-staff/messages", ["messages"]],
  ["/dashboard/admin-staff/calendar", ["calendar"]],
  ["/dashboard/admin-staff/email-templates", ["email_templates"]],
  ["/dashboard/admin-staff/support/help", ["help_support"]],
  ["/dashboard/admin-staff/support/tickets", ["tickets"]],
  ["/dashboard/admin-staff/support/faq", ["faq"]],
  ["/dashboard/admin-staff/reports", ["reports"]],
  ["/dashboard/admin-staff/private-files", ["private_files"]],
  ["/dashboard/admin-staff/settings/email", ["email_configuration"]],
  ["/dashboard/admin-staff/settings/activity", ["recent_activities"]],
  ["/dashboard/admin-staff/settings/users", ["all_users"]],
];

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const db = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll(items: CookieToSet[]) {
          items.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          items.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));
  const { data: profile } = await db
    .from("profiles")
    .select("role,status")
    .eq("id", user.id)
    .single();
  if (!profile || profile.status !== "active")
    return NextResponse.redirect(new URL("/login", req.url));

  const segment = req.nextUrl.pathname.split("/")[2];
  const expectedSegment = profile.role.replace("_", "-");
  if (segment && segment !== expectedSegment)
    return NextResponse.redirect(
      new URL(`/dashboard/${expectedSegment}`, req.url),
    );

  if (profile.role === "admin_staff") {
    const match = staffRouteModules.find(([prefix]) =>
      req.nextUrl.pathname.startsWith(prefix),
    );
    if (match) {
      const [{ data: rows }, { data: staffProfile }] = await Promise.all([
        db
          .from("admin_permissions")
          .select("module,actions")
          .eq("admin_staff_id", user.id)
          .in("module", match[1]),
        db
          .from("profiles")
          .select("staff_role")
          .eq("id", user.id)
          .maybeSingle(),
      ]);
      const { data: assignedRole } = staffProfile?.staff_role
        ? await db
            .from("staff_roles")
            .select("permissions")
            .ilike("name", staffProfile.staff_role.trim())
            .maybeSingle()
        : { data: null };
      const copied = Object.fromEntries(
        (rows || []).map((row) => [row.module, row.actions || {}]),
      );
      const merged = {
        ...copied,
        ...((assignedRole?.permissions || {}) as Record<
          string,
          Record<string, boolean>
        >),
      };
      const allowed = match[1].some((module) =>
        Object.values(merged[module] || {}).some(Boolean),
      );
      if (!allowed)
        return NextResponse.redirect(
          new URL("/dashboard/admin-staff", req.url),
        );
    }
  }
  return res;
}

export const config = { matcher: ["/dashboard/:path*"] };
