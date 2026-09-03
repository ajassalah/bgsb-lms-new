import { redirect } from "next/navigation";
import { TermsAcceptanceForm } from "@/components/terms-acceptance-form";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function TermsAcceptancePage() {
  const profile = await requireProfile();
  const admin = createAdminClient();
  const { data: terms } = await admin
    .from("legal_terms")
    .select("id,version")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const dashboard = `/dashboard/${profile.role.replace("_", "-")}`;
  if (!terms) redirect(dashboard);
  const { data: acceptance } = await admin
    .from("terms_acceptances")
    .select("id")
    .eq("user_id", profile.id)
    .eq("terms_version", terms.version)
    .maybeSingle();
  if (acceptance) redirect(dashboard);
  return (
    <main className="fixed inset-0 z-[99999] grid min-h-screen place-items-center overflow-y-auto bg-[#07111f]/90 p-4 backdrop-blur-md">
      <TermsAcceptanceForm version={terms.version} />
    </main>
  );
}
