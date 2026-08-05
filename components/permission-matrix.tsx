"use client";
export type PermissionSet = Record<
  string,
  { view: boolean; create: boolean; edit: boolean; delete: boolean }
>;
export const permissionModules = [
  "Dashboard",
  "Enrollment",
  "Courses",
  "Categories",
  "Certificates",
  "Live Classes",
  "Assignments",
  "Students",
  "Instructors",
  "Staff",
  "Announcements",
  "Messages",
  "Calendar",
  "Tickets",
  "FAQ",
  "Reports",
  "System Settings",
];
export function PermissionMatrix({
  value,
  onChange,
}: {
  value: PermissionSet;
  onChange: (value: PermissionSet) => void;
}) {
  function toggle(
    module: string,
    action: "view" | "create" | "edit" | "delete",
  ) {
    const current = value[module] || {
      view: false,
      create: false,
      edit: false,
      delete: false,
    };
    onChange({
      ...value,
      [module]: { ...current, [action]: !current[action] },
    });
  }
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-400">
          <tr>
            <th className="p-4">Menu</th>
            {["View", "Create", "Edit", "Delete"].map((x) => (
              <th className="p-4 text-center" key={x}>
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {permissionModules.map((module) => (
            <tr key={module}>
              <td className="p-4 font-semibold text-navy">{module}</td>
              {(["view", "create", "edit", "delete"] as const).map((action) => (
                <td className="p-4 text-center" key={action}>
                  <input
                    type="checkbox"
                    checked={value[module]?.[action] || false}
                    onChange={() => toggle(module, action)}
                    className="size-4 accent-red"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
