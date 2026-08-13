import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import {
  SupportFaqManagement,
  type FaqRow,
} from "@/components/support-faq-management";
import { unstable_noStore as noStore } from "next/cache";

export default async function FaqPage() {
  noStore();
  const profile = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("support_faqs")
      .select("id,question,answer,status")
      .order("created_at", { ascending: false });
  return (
    <SuperAdminShell name={profile.full_name}>
      <SupportFaqManagement initialRows={(data || []) as FaqRow[]} />
    </SuperAdminShell>
  );
}
