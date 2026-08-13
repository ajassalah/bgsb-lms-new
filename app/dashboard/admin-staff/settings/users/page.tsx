import { requireProfile } from "@/lib/auth";
import { StaffPageShell } from "@/components/staff-page-shell";
import { AllUsersPage } from "@/components/all-users-page";
export default async function Page() {
  const p = await requireProfile("admin_staff");
  return (
    <StaffPageShell name={p.full_name}>
      <AllUsersPage />
    </StaffPageShell>
  );
}
