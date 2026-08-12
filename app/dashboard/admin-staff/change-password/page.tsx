import { DashboardShell } from "@/components/dashboard-shell";
import { ChangePasswordForm } from "@/components/change-password-form";
import { requireProfile } from "@/lib/auth";
export default async function StaffPassword() {
  const p = await requireProfile("admin_staff");
  return (
    <DashboardShell
      role="admin_staff"
      name={p.full_name}
      email={p.email}
      avatar={p.avatar_url}
    >
      <ChangePasswordForm
        email={p.email}
        avatar={p.avatar_url}
        name={p.full_name}
      />
    </DashboardShell>
  );
}
