import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import {
  CurriculumDirectory,
  type CurriculumCourseRow,
} from "@/components/curriculum-directory";

export default async function CurriculumPage() {
  const profile = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("courses")
      .select("id,title,status,category:categories(name)")
      .order("title");
  const rows: CurriculumCourseRow[] = (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    category: row.category?.name || "Uncategorized",
    status: row.status,
  }));
  return (
    <StaffPageShell name={profile.full_name}>
      <CurriculumDirectory rows={rows} basePath="/dashboard/admin-staff" />
    </StaffPageShell>
  );
}
