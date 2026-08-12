import { requireProfile } from "@/lib/auth";
import { StaffPageShell } from "@/components/staff-page-shell";
import { SupportFaqForm } from "@/components/support-faq-form";

export default async function NewFaqPage() {
  const profile = await requireProfile("admin_staff");
  return (
    <StaffPageShell name={profile.full_name}>
      <SupportFaqForm />
    </StaffPageShell>
  );
}
