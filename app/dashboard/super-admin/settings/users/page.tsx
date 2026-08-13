import { requireProfile } from "@/lib/auth";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { AllUsersPage } from "@/components/all-users-page";
export default async function Page() {
  const p = await requireProfile("super_admin");
  return (
    <SuperAdminShell name={p.full_name}>
      <AllUsersPage />
    </SuperAdminShell>
  );
}
