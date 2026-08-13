import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import {
  SupportFaqManagement,
  type FaqRow,
} from "@/components/support-faq-management";
import { unstable_noStore as noStore } from "next/cache";

export default async function FaqPage() {
  noStore();
  const profile = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("support_faqs")
      .select("id,question,answer,status")
      .order("created_at", { ascending: false });
  return (
    <StaffPageShell name={profile.full_name}>
      <SupportFaqManagement initialRows={(data || []) as FaqRow[]} />
    </StaffPageShell>
  );
}
