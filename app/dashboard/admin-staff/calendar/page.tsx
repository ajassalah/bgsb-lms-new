import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { CalendarManagement } from "@/components/calendar-management";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const profile = await requireProfile("admin_staff");
  const db = createAdminClient();
  const [{ data: appointments }, { data: liveClasses }] = await Promise.all([
    db
      .from("calendar_appointments")
      .select("id,title,description,scheduled_start,scheduled_end")
      .order("scheduled_start", { ascending: true }),
    db
      .from("live_sessions")
      .select("id,title,description,scheduled_start,scheduled_end,meeting_url")
      .order("scheduled_start", { ascending: true }),
  ]);
  const events = [
    ...(appointments || []).map((item) => ({
      ...item,
      id: `appointment-${item.id}`,
      source: "appointment" as const,
    })),
    ...(liveClasses || []).map((item) => ({
      ...item,
      id: `class-${item.id}`,
      source: "live_class" as const,
    })),
  ].sort((a, b) => +new Date(a.scheduled_start) - +new Date(b.scheduled_start));
  return (
    <StaffPageShell name={profile.full_name}>
      <CalendarManagement
        initialAppointments={events}
        initialSelected={
          /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date || "")
            ? searchParams.date
            : undefined
        }
      />
    </StaffPageShell>
  );
}
