import { DashboardShell } from "@/components/dashboard-shell";
import { ChangePasswordForm } from "@/components/change-password-form";
import { requireProfile } from "@/lib/auth";

export default async function StudentChangePassword() {
  const profile = await requireProfile("student");
  return (
    <DashboardShell
      role="student"
      name={profile.full_name}
      email={profile.email}
      avatar={profile.avatar_url}
    >
      <ChangePasswordForm
        email={profile.email}
        avatar={profile.avatar_url}
        name={profile.full_name}
      />
    </DashboardShell>
  );
}
