import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { SuperAdminShell } from "@/components/super-admin-shell";
import {
  ClassSectionPage,
  type ClassSection,
} from "@/components/class-section-page";
const valid = ["attendance", "students", "instructors", "classes", "reports"];
export default async function Page({
  params,
}: {
  params: { section: string };
}) {
  if (!valid.includes(params.section)) notFound();
  const p = await requireProfile("super_admin");
  return (
    <SuperAdminShell name={p.full_name}>
      <ClassSectionPage section={params.section as ClassSection} />
    </SuperAdminShell>
  );
}
