import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { ReportsDashboard } from "@/components/reports-dashboard";

export default async function ReportsPage() {
  const profile = await requireProfile("admin_staff"),
    db = createAdminClient();
  const [{ data: enrollments }, { data: courses }, { data: classes }] =
    await Promise.all([
      db
        .from("enrollments")
        .select("id,enrolled_at,course_id,course:courses(title)")
        .order("enrolled_at"),
      db.from("courses").select("id,title,created_at").order("created_at"),
      db.from("live_sessions").select("id,created_at").order("created_at"),
    ]);
  return (
    <StaffPageShell name={profile.full_name}>
      <ReportsDashboard
        enrollments={(enrollments || []).map((x: any) => ({
          id: x.id,
          date: x.enrolled_at,
          courseId: x.course_id,
          course: x.course?.title || "Unknown course",
        }))}
        courses={(courses || []).map((x) => ({
          id: x.id,
          title: x.title,
          date: x.created_at,
        }))}
        liveClasses={(classes || []).map((x) => ({
          id: x.id,
          date: x.created_at,
        }))}
      />
    </StaffPageShell>
  );
}
