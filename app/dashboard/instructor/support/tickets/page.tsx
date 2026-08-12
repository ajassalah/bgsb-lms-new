import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ReadOnlyTable } from "@/components/instructor-portal-pages";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function Page() {
  const p = await requireProfile("instructor"),
    { data } = await createAdminClient()
      .from("support_tickets")
      .select("id,subject,priority,status,created_at")
      .eq("created_by", p.id)
      .order("created_at", { ascending: false });
  return (
    <DashboardShell role="instructor" name={p.full_name}>
      <div className="mb-[-52px] flex justify-end">
        <Link
          href="/dashboard/instructor/support/tickets/new"
          className="btn-primary relative z-10 gap-2"
        >
          <Plus className="size-4" />
          New
        </Link>
      </div>
      <ReadOnlyTable
        title="Tickets"
        columns={["Subject", "Priority", "Created", "Status"]}
        rows={(data || []).map((x) => ({
          id: x.id,
          cells: [
            x.subject,
            x.priority,
            new Date(x.created_at).toLocaleString("en-GB"),
            x.status,
          ],
          view: `/dashboard/instructor/support/tickets/${x.id}`,
        }))}
      />
    </DashboardShell>
  );
}
