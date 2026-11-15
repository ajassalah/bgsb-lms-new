import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type CookieToSet = { name: string; value: string; options: CookieOptions };

type StaffPermissions = Record<string, Record<string, boolean>>;

const legacyPermissionAliases: Record<string, string[]> = {
  Enrollment: ["enrollment"],
  Courses: ["courses", "curriculum", "curriculum_overview"],
  Categories: ["categories"],
  Certificates: ["certificates", "certificate_students"],
  "Live Classes": ["live_classes"],
  Assignments: [
    "assignments",
    "assignment_tab",
    "assignment_students",
    "assignment_student_modules",
    "submitted_assignments",
  ],
  Students: ["students"],
  Instructors: ["instructors"],
  Staff: ["staff", "roles"],
  Announcements: ["announcements"],
  Messages: ["messages"],
  Calendar: ["calendar"],
  Tickets: ["tickets"],
  "Support Assistants": ["support_assistants"],
  FAQ: ["faq"],
  Reports: ["reports"],
  "System Settings": [
    "all_users",
    "email_configuration",
    "recent_activities",
    "terms_conditions",
  ],
};

function expandActions(actions: Record<string, boolean>) {
  const allowed = Object.values(actions).some(Boolean);
  return {
    ...actions,
    access: actions.access ?? actions.view ?? allowed,
    view: actions.view ?? actions.access ?? allowed,
  };
}

function normalizeStaffPermissions(permissions: StaffPermissions) {
  const normalized: StaffPermissions = {};
  for (const [module, actions] of Object.entries(permissions || {})) {
    const targets = legacyPermissionAliases[module] || [module];
    for (const target of targets)
      normalized[target] = {
        ...(normalized[target] || {}),
        ...expandActions(actions || {}),
      };
  }
  return normalized;
}

const staffRouteModules: [string, string[]][] = [
  ["/dashboard/admin-staff/class/attendance", ["class_attendance"]],
  ["/dashboard/admin-staff/class/students", ["class_students"]],
  ["/dashboard/admin-staff/class/instructors", ["class_instructors"]],
  ["/dashboard/admin-staff/class/classes", ["class_management"]],
  ["/dashboard/admin-staff/class/reports", ["class_reports"]],
  ["/dashboard/admin-staff/class", ["class_dashboard"]],
  ["/dashboard/admin-staff/enrollments", ["enrollment"]],
  ["/dashboard/admin-staff/intakes", ["intakes"]],
  ["/dashboard/admin-staff/batches", ["batches"]],
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
  ["/dashboard/admin-staff/support/assistants", ["support_assistants"]],
  ["/dashboard/admin-staff/support/tickets", ["tickets"]],
  ["/dashboard/admin-staff/support/faq", ["faq"]],
  ["/dashboard/admin-staff/reports", ["reports"]],
  ["/dashboard/admin-staff/private-files", ["private_files"]],
  ["/dashboard/admin-staff/terms-and-conditions", ["terms_conditions"]],
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
  // The session is verified by Supabase Auth; everything after that is read
  // with the service-role client so it doesn't depend on the database API
  // accepting the user's JWT.
  const {
    data: { user },
    error: userError,
  } = await db.auth.getUser();
  if (!user) {
    if (req.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-")))
      console.warn("[middleware] session rejected", {
        path: req.nextUrl.pathname,
        error: userError?.message,
      });
    return NextResponse.redirect(new URL("/login", req.url));
  }
  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role,status")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || profile.status !== "active") {
    console.warn("[middleware] profile check failed", {
      userId: user.id,
      status: profile?.status,
      error: profileError?.message ?? (profile ? undefined : "no profile row"),
    });
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { data: currentTerms } = await admin
    .from("legal_terms")
    .select("version")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (currentTerms) {
    const { data: acceptance } = await admin
      .from("terms_acceptances")
      .select("id")
      .eq("user_id", user.id)
      .eq("terms_version", currentTerms.version)
      .maybeSingle();
    if (!acceptance) {
      const acceptanceUrl = new URL("/terms-acceptance", req.url);
      acceptanceUrl.searchParams.set(
        "returnTo",
        `${req.nextUrl.pathname}${req.nextUrl.search}`,
      );
      return NextResponse.redirect(acceptanceUrl);
    }
  }

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
        admin
          .from("admin_permissions")
          .select("module,actions")
          .eq("admin_staff_id", user.id)
          .in("module", match[1]),
        admin
          .from("profiles")
          .select("staff_role")
          .eq("id", user.id)
          .maybeSingle(),
      ]);
      const { data: assignedRole } = staffProfile?.staff_role
        ? await admin
            .from("staff_roles")
            .select("permissions")
            .ilike("name", staffProfile.staff_role.trim())
            .maybeSingle()
        : { data: null };
      const copied = Object.fromEntries(
        (rows || []).map((row) => [row.module, row.actions || {}]),
      );
      const merged = normalizeStaffPermissions({
        ...copied,
        ...((assignedRole?.permissions || {}) as Record<
          string,
          Record<string, boolean>
        >),
      });
      const allowed = match[1].some((module) =>
        module === "recent_activities"
          ? staffProfile?.staff_role?.trim().toLowerCase() === "manager"
          : Object.values(merged[module] || {}).some(Boolean),
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
