"use client";

import {
  CheckCircle2,
  Eye,
  FilePlus2,
  Import,
  Mail,
  MessageSquare,
  Pencil,
  Plus,
  ShieldCheck,
  ToggleRight,
  Trash2,
  Upload,
  UserCheck,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";

export type PermissionSet = Record<string, Record<string, boolean>>;
type PermissionModule = { key: string; label: string; actions: string[] };

export const permissionModules: PermissionModule[] = [
  {
    key: "enrollment",
    label: "Enrollment",
    actions: ["create", "edit", "status", "delete"],
  },
  {
    key: "courses",
    label: "Course List",
    actions: [
      "bulk_import",
      "create",
      "edit",
      "manage_student",
      "manage_instructor",
      "curriculum",
      "faq",
      "published_toggle",
      "delete",
    ],
  },
  {
    key: "curriculum",
    label: "Course List / Curriculum",
    actions: [
      "bulk_import",
      "create",
      "edit",
      "add_assignment",
      "add_lesson",
      "delete",
    ],
  },
  {
    key: "curriculum_assignments",
    label: "Curriculum / Add Assignment",
    actions: ["create", "edit", "delete"],
  },
  {
    key: "categories",
    label: "Category",
    actions: ["create", "edit", "delete", "status"],
  },
  { key: "curriculum_overview", label: "Curriculum", actions: ["view"] },
  {
    key: "certificates",
    label: "Certificate",
    actions: [
      "add_certificate",
      "manage_student",
      "manage_certificate",
      "view_certificate",
      "remove_certificate",
    ],
  },
  {
    key: "certificate_students",
    label: "Certificate / Manage Student",
    actions: ["add_certificate", "remove_certificate"],
  },
  {
    key: "live_classes",
    label: "Live Classes",
    actions: ["create", "view", "edit", "delete"],
  },
  { key: "assignments", label: "Assignments", actions: ["view"] },
  {
    key: "assignment_tab",
    label: "Assignments / Assignment Tab",
    actions: ["view"],
  },
  {
    key: "assignment_students",
    label: "Assignments / Student Tab",
    actions: ["view"],
  },
  { key: "class_dashboard", label: "CLASS / Dashboard", actions: ["access"] },
  { key: "class_attendance", label: "CLASS / Attendance", actions: ["access"] },
  { key: "class_students", label: "CLASS / Students", actions: ["access"] },
  {
    key: "class_instructors",
    label: "CLASS / Instructors",
    actions: ["access"],
  },
  { key: "class_management", label: "CLASS / Class", actions: ["access"] },
  { key: "class_reports", label: "CLASS / Reports", actions: ["access"] },
  {
    key: "assignment_student_modules",
    label: "Student Overview / Module",
    actions: ["view"],
  },
  {
    key: "submitted_assignments",
    label: "Student Overview / Submitted Assignments",
    actions: ["check", "edit", "delete"],
  },
  {
    key: "students",
    label: "Manage Student",
    actions: [
      "bulk_import",
      "create",
      "edit",
      "view",
      "verification",
      "delete",
      "send_email",
      "whatsapp",
      "status",
    ],
  },
  {
    key: "instructors",
    label: "Instructor",
    actions: [
      "view",
      "create",
      "edit",
      "delete",
      "send_email",
      "whatsapp",
      "status",
    ],
  },
  {
    key: "staff",
    label: "All Staff",
    actions: ["create", "view", "edit", "delete", "send_email", "whatsapp"],
  },
  {
    key: "roles",
    label: "Roles & Permissions",
    actions: ["create", "edit", "delete"],
  },
  {
    key: "announcements",
    label: "Announcement",
    actions: ["create", "view", "edit", "delete"],
  },
  { key: "messages", label: "Messages", actions: ["access"] },
  {
    key: "calendar",
    label: "Calendar",
    actions: ["create", "edit", "delete", "status"],
  },
  {
    key: "all_users",
    label: "All Users",
    actions: ["view", "manage_password", "send_reset_link", "status"],
  },
  {
    key: "email_templates",
    label: "Email Templates",
    actions: ["create", "edit", "delete"],
  },
  {
    key: "tickets",
    label: "Ticket",
    actions: ["create", "reply", "verify_status"],
  },
  {
    key: "faq",
    label: "FAQ",
    actions: ["create", "view", "edit", "delete", "status"],
  },
  { key: "reports", label: "Reports", actions: ["access"] },
  {
    key: "private_files",
    label: "Private Files",
    actions: ["upload_file", "create_folder", "edit", "delete"],
  },
  { key: "help_support", label: "Help & Support", actions: ["access"] },
  {
    key: "email_configuration",
    label: "Email Configuration",
    actions: ["access"],
  },
  { key: "recent_activities", label: "Recent Activities", actions: ["access"] },
];

const labels: Record<string, string> = {
  bulk_import: "Bulk Import",
  manage_student: "Manage Student",
  manage_instructor: "Manage Instructor",
  published_toggle: "Published Toggle",
  add_assignment: "Add Assignment",
  add_lesson: "Add Lesson",
  add_certificate: "Add Certificate",
  manage_certificate: "Manage Certificate",
  view_certificate: "View Certificate",
  remove_certificate: "Remove Certificate",
  send_email: "Send Email",
  verify_status: "Verify Status",
  upload_file: "Upload File",
  create_folder: "Create Folder",
  access: "Access",
  reply: "Reply",
  verification: "Verification",
  whatsapp: "WhatsApp",
  faq: "FAQ",
  curriculum: "Curriculum",
  status: "Status",
  manage_password: "Manage Password",
  send_reset_link: "Send Password Reset Link",
  check: "Check",
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
};
const iconFor = (action: string) =>
  action === "delete" || action === "remove_certificate"
    ? Trash2
    : action === "edit"
      ? Pencil
      : action === "view" ||
          action === "view_certificate" ||
          action === "access"
        ? Eye
        : action.includes("import")
          ? Import
          : action.includes("upload")
            ? Upload
            : action.includes("email")
              ? Mail
              : action === "whatsapp" || action === "reply"
                ? MessageSquare
                : action.includes("manage_student")
                  ? Users
                  : action.includes("manage_instructor")
                    ? UserCog
                    : action === "verification" || action === "verify_status"
                      ? UserCheck
                      : action === "status" || action.includes("toggle")
                        ? ToggleRight
                        : action === "check"
                          ? CheckCircle2
                          : action.includes("certificate")
                            ? ShieldCheck
                            : action.includes("assignment") ||
                                action.includes("lesson")
                              ? FilePlus2
                              : Plus;

export function PermissionMatrix({
  value,
  onChange,
}: {
  value: PermissionSet;
  onChange: (value: PermissionSet) => void;
}) {
  function toggle(module: PermissionModule, action: string) {
    const current = value[module.key] || {};
    onChange({
      ...value,
      [module.key]: { ...current, [action]: !current[action] },
    });
  }
  function toggleAll(module: PermissionModule) {
    const all = module.actions.every((action) => value[module.key]?.[action]);
    onChange({
      ...value,
      [module.key]: Object.fromEntries(
        module.actions.map((action) => [action, !all]),
      ),
    });
  }
  return (
    <div className="space-y-4">
      {permissionModules.map((module) => {
        const all =
          module.key === "curriculum_overview"
            ? !!value[module.key]?.full_access
            : module.actions.every((action) => value[module.key]?.[action]);
        return (
          <section
            key={module.key}
            className="rounded-2xl border bg-white p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-navy">{module.label}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Enable only the actions this staff role may use.
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold">
                <span>Full Access</span>
                <Toggle
                  checked={all}
                  onChange={() =>
                    module.key === "curriculum_overview"
                      ? onChange({
                          ...value,
                          [module.key]: {
                            ...value[module.key],
                            view: true,
                            full_access: !all,
                          },
                        })
                      : toggleAll(module)
                  }
                />
              </label>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {module.actions.map((action) => {
                const Icon = iconFor(action);
                return (
                  <label
                    key={action}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition hover:bg-slate-50"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                      <Icon className="size-4 shrink-0 text-red" />
                      {labels[action] || action.replaceAll("_", " ")}
                    </span>
                    <Toggle
                      checked={!!value[module.key]?.[action]}
                      onChange={() => toggle(module, action)}
                    />
                  </label>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(event) => {
        event.preventDefault();
        onChange();
      }}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-red" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-1 size-4 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`}
      />
    </button>
  );
}
