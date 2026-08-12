import { DashboardShell } from "@/components/dashboard-shell";
import { ReadOnlyTable } from "@/components/instructor-portal-pages";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function Page() {
  const p = await requireProfile("instructor"),
    { data } = await createAdminClient()
      .from("announcements")
      .select("id,title,body,created_at")
      .order("created_at", { ascending: false });
  return (
    <DashboardShell role="instructor" name={p.full_name}>
      <ReadOnlyTable
        title="Announcements"
        columns={["Title", "Description", "Date"]}
        rows={(data || []).map((x) => ({
          id: x.id,
          cells: [
            x.title,
            <span className="line-clamp-2" key="body">
              {(x.body || "").replace(/<[^>]+>/g, "")}
            </span>,
            new Date(x.created_at).toLocaleDateString("en-GB"),
          ],
          view: `/dashboard/instructor/announcements/${x.id}`,
        }))}
      />
    </DashboardShell>
  );
}
