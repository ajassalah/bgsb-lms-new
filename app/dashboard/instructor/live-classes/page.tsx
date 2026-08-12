import { DashboardShell } from "@/components/dashboard-shell";
import { InstructorLiveClasses } from "@/components/instructor-portal-pages";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function Page() {
  const p = await requireProfile("instructor"),
    db = createAdminClient(),
    [{ data: links }, { data: direct }] = await Promise.all([
      db
        .from("live_session_instructors")
        .select("session_id")
        .eq("instructor_id", p.id),
      db.from("live_sessions").select("id").eq("instructor_id", p.id),
    ]),
    ids = Array.from(
      new Set([
        ...(links || []).map((x) => x.session_id),
        ...(direct || []).map((x) => x.id),
      ]),
    ),
    { data } = ids.length
      ? await db
          .from("live_sessions")
          .select(
            "id,title,description,thumbnail_url,scheduled_start,scheduled_end,meeting_url",
          )
          .in("id", ids)
          .order("scheduled_start")
      : { data: [] };
  return (
    <DashboardShell role="instructor" name={p.full_name}>
      <InstructorLiveClasses
        appointmentUrl={`/dashboard/instructor/calendar?date=${new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Colombo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())}`}
        rows={(data || []).map((x) => ({
          id: x.id,
          title: x.title,
          description: x.description || "",
          thumbnail: x.thumbnail_url,
          start: x.scheduled_start,
          end: x.scheduled_end,
          url: x.meeting_url,
        }))}
      />
    </DashboardShell>
  );
}
