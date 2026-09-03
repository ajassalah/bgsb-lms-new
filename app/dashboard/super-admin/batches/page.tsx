import { requireProfile } from "@/lib/auth";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { BatchListContent } from "@/components/intake-batch-page-content";
export default async function Page() {
  const p = await requireProfile("super_admin");
  return (
    <SuperAdminShell name={p.full_name}>
      <BatchListContent basePath="/dashboard/super-admin/batches" />
    </SuperAdminShell>
  );
}
