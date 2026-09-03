import { requireProfile } from "@/lib/auth";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { IntakeFormContent } from "@/components/intake-batch-page-content";
export default async function Page() {
  const p = await requireProfile("super_admin");
  return (
    <SuperAdminShell name={p.full_name}>
      <IntakeFormContent basePath="/dashboard/super-admin/intakes" />
    </SuperAdminShell>
  );
}
