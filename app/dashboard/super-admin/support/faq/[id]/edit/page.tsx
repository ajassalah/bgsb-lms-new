import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { SupportFaqForm } from "@/components/support-faq-form";

export default async function EditFaqPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("support_faqs")
      .select("id,question,answer,status")
      .eq("id", params.id)
      .single();
  if (!data) notFound();
  return (
    <SuperAdminShell name={profile.full_name}>
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
    </SuperAdminShell>
  );
}
