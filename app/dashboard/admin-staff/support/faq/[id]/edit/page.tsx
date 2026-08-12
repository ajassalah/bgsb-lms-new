import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { SupportFaqForm } from "@/components/support-faq-form";

export default async function EditFaqPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("support_faqs")
      .select("id,question,answer,status")
      .eq("id", params.id)
      .single();
  if (!data) notFound();
  return (
    <StaffPageShell name={profile.full_name}>
      <SupportFaqForm
        faq={
          data as {
            id: string;
            question: string;
            answer: string;
            status: "active" | "inactive";
          }
        }
      />
    </StaffPageShell>
  );
}
