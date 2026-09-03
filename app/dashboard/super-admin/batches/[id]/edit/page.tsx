import { requireProfile } from "@/lib/auth";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { BatchFormContent } from "@/components/intake-batch-page-content";
export default async function Page({ params }: { params: { id: string } }) {
  const p = await requireProfile("super_admin");
  return (
    <SuperAdminShell name={p.full_name}>
      <BatchFormContent
        id={params.id}
        basePath="/dashboard/super-admin/batches"
      />
    </SuperAdminShell>
  );
}
