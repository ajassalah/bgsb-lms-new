import { DashboardShell } from "@/components/dashboard-shell";
import { ReadOnlyTable } from "@/components/instructor-portal-pages";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function StudentAnnouncements() {
  const profile = await requireProfile("student");
  const now = new Date().toISOString();
  const { data } = await createAdminClient()
    .from("announcements")
    .select("id,title,body,created_at,scheduled_at")
    .contains("receiver_types", ["student"])
    .or(`scheduled_at.is.null,scheduled_at.lte.${now}`)
    .order("created_at", { ascending: false });
  return (
    <DashboardShell
      role="student"
      name={profile.full_name}
      email={profile.email}
      avatar={profile.avatar_url}
    >
      <ReadOnlyTable
        title="Announcements"
        columns={["Title", "Description", "Date"]}
        rows={(data || []).map((row) => ({
          id: row.id,
          cells: [
            row.title,
            <span className="line-clamp-2" key="body">
              {(row.body || "").replace(/<[^>]+>/g, "")}
            </span>,
            new Date(row.scheduled_at || row.created_at).toLocaleDateString(
              "en-GB",
            ),
          ],
          view: `/dashboard/student/announcements/${row.id}`,
        }))}
      />
    </DashboardShell>
  );
}
