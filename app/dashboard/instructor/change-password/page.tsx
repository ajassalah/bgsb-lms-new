import { DashboardShell } from "@/components/dashboard-shell";
import { ChangePasswordForm } from "@/components/change-password-form";
import { requireProfile } from "@/lib/auth";
export default async function InstructorChangePassword() {
  const profile = await requireProfile("instructor");
  return (
    <DashboardShell role="instructor" name={profile.full_name}>
      <ChangePasswordForm
        email={profile.email}
        avatar={profile.avatar_url}
        name={profile.full_name}
      />
    </DashboardShell>
  );
}
