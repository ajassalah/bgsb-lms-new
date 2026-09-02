import { DashboardShell } from "@/components/dashboard-shell";
import { ReadOnlyTable } from "@/components/instructor-portal-pages";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { htmlToPlainText } from "@/lib/html-text";
export default async function Page() {
  const p = await requireProfile("instructor"),
    { data } = await createAdminClient()
      .from("support_faqs")
      .select("id,question,answer,status")
      .eq("status", "active")
      .order("created_at", { ascending: false });
  return (
    <DashboardShell role="instructor" name={p.full_name}>
      <ReadOnlyTable
        title="FAQ"
        columns={["Question", "Answer"]}
        rows={(data || []).map((x) => ({
          id: x.id,
          cells: [
            x.question,
            <span className="line-clamp-2" key="answer">
              {htmlToPlainText(x.answer)}
            </span>,
          ],
          view: `/dashboard/instructor/support/faq/${x.id}`,
        }))}
      />
    </DashboardShell>
  );
}
