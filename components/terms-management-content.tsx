import { createAdminClient } from "@/lib/supabase/admin";
import { TermsManagement } from "./terms-management";

export async function TermsManagementContent() {
  const { data } = await createAdminClient()
    .from("legal_terms")
    .select("id,version,title,effective_date,content,is_published,updated_at")
    .order("is_published", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return <TermsManagement initialTerms={data} />;
}
