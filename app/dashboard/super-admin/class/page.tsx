import { requireProfile } from "@/lib/auth";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { ClassSectionPage } from "@/components/class-section-page";
export default async function Page() {
  const p = await requireProfile("super_admin");
  return (
    <SuperAdminShell name={p.full_name}>
      <ClassSectionPage section="dashboard" />
    </SuperAdminShell>
  );
}
