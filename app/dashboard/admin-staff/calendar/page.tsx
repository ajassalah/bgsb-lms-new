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
  const { data: assignedLiveClasses } = await db
    .from("live_session_staff")
    .select("session_id")
    .eq("staff_id", profile.id);
  const assignedLiveClassIds = (assignedLiveClasses || []).map(
    (row) => row.session_id,
  );
  const [
    { data: appointments },
    { data: liveClasses },
    { data: users },
    { data: assignments },
  ] = await Promise.all([
    db
      .from("calendar_appointments")
      .select("id,title,description,scheduled_start,scheduled_end")
      .order("scheduled_start", { ascending: true }),
    assignedLiveClassIds.length
      ? db
          .from("live_sessions")
          .select(
            "id,title,description,scheduled_start,scheduled_end,meeting_url",
          )
          .in("id", assignedLiveClassIds)
          .order("scheduled_start", { ascending: true })
      : Promise.resolve({ data: [] as any[] }),
    db
      .from("profiles")
      .select("id,full_name,role,avatar_url")
      .in("role", ["instructor", "student", "admin_staff"])
      .eq("status", "active")
      .order("full_name"),
    db.from("calendar_appointment_users").select("appointment_id,user_id"),
  ]);
  const events = [
    ...(appointments || []).map((item) => ({
      ...item,
      id: `appointment-${item.id}`,
      source: "appointment" as const,
      assignedUserIds: (assignments || [])
        .filter((x) => x.appointment_id === item.id)
        .map((x) => x.user_id),
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
        assignableUsers={(users || []).map((x) => ({
          id: x.id,
          name: x.full_name,
          role: x.role,
          avatar: x.avatar_url,
        }))}
        initialSelected={
          /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date || "")
            ? searchParams.date
            : undefined
        }
      />
    </StaffPageShell>
  );
}
