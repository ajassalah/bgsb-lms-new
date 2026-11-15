import { requireProfile } from "@/lib/auth";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { ChangePasswordForm } from "@/components/change-password-form";
export default async function Page() {
  const p = await requireProfile("super_admin");
  return (
    <SuperAdminShell name={p.full_name}>
      <ChangePasswordForm
        email={p.email ?? ""}
        avatar={p.avatar_url}
        name={p.full_name}
      />
    </SuperAdminShell>
  );
}
