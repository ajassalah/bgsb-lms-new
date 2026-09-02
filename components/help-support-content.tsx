import { createAdminClient } from "@/lib/supabase/admin";
import { HelpSupportCenter } from "./help-support-center";

export async function HelpSupportContent({ basePath }: { basePath: string }) {
  const { data } = await createAdminClient()
    .from("support_faqs")
    .select("id,question,answer")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  return (
    <HelpSupportCenter
      faqs={data || []}
      ticketNewUrl={`${basePath}/tickets/new`}
      ticketsUrl={`${basePath}/tickets`}
      faqUrl={`${basePath}/faq`}
      contact={{
        email: process.env.SUPPORT_EMAIL || "info@bgsb.lk",
        phone: process.env.SUPPORT_PHONE || "+94 117 221 192",
        hours:
          process.env.SUPPORT_HOURS || "Monday – Friday, 9:00 AM – 5:00 PM",
      }}
    />
  );
}
