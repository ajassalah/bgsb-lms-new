import { DashboardShell } from "@/components/dashboard-shell";
import { ReadOnlyTable } from "@/components/instructor-portal-pages";
import { requireProfile } from "@/lib/auth";
import { htmlToPlainText } from "@/lib/html-text";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StudentFaq() {
  const profile = await requireProfile("student");
  const { data } = await createAdminClient()
    .from("support_faqs")
    .select("id,question,answer,status")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  return (
    <DashboardShell
      role="student"
      name={profile.full_name}
      email={profile.email}
      avatar={profile.avatar_url}
    >
      <ReadOnlyTable
        title="FAQ"
        portalLabel="Student Portal"
        directView
        columns={["Question", "Answer"]}
        rows={(data || []).map((item) => ({
          id: item.id,
          cells: [
            item.question,
            <span className="line-clamp-2" key="answer">
              {htmlToPlainText(item.answer)}
            </span>,
          ],
          view: `/dashboard/student/support/faq/${item.id}`,
        }))}
      />
    </DashboardShell>
  );
}
