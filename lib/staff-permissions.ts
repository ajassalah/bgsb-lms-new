import { createAdminClient } from "@/lib/supabase/admin";

export type StaffPermissions = Record<string, Record<string, boolean>>;

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
  return {
    ...actions,
    access:
      actions.access ?? actions.view ?? Object.values(actions).some(Boolean),
    view:
      actions.view ?? actions.access ?? Object.values(actions).some(Boolean),
  };
}

export function normalizeStaffPermissions(
  permissions: StaffPermissions,
): StaffPermissions {
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

export async function getStaffPermissions(
  userId: string,
): Promise<StaffPermissions> {
  const admin = createAdminClient();
  const [{ data: profile }, { data: rows }] = await Promise.all([
    admin
      .from("profiles")
      .select("role,staff_role")
      .eq("id", userId)
      .maybeSingle(),
    admin
      .from("admin_permissions")
      .select("module,actions")
      .eq("admin_staff_id", userId),
  ]);
  if (profile?.role !== "admin_staff") return {};
  const copied = Object.fromEntries(
    (rows || []).map((row) => [
      row.module,
      (row.actions || {}) as Record<string, boolean>,
    ]),
  );
  if (!profile.staff_role) return copied;
  const { data: assignedRole } = await admin
    .from("staff_roles")
    .select("permissions")
    .ilike("name", profile.staff_role.trim())
    .maybeSingle();
  return normalizeStaffPermissions({
    ...copied,
    ...((assignedRole?.permissions || {}) as StaffPermissions),
  });
}

export async function staffCan(userId: string, module: string, action: string) {
  const { data: profile } = await createAdminClient()
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.role === "super_admin") return true;
  if (profile?.role !== "admin_staff") return false;
  const permissions = await getStaffPermissions(userId);
  return !!permissions[module]?.[action] || !!permissions[module]?.full_access;
}

export async function adminActorCan(
  userId: string,
  module: string,
  action: string,
) {
  return staffCan(userId, module, action);
}
