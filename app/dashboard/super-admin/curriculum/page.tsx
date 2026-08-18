import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import {
  CurriculumDirectory,
  type CurriculumCourseRow,
} from "@/components/curriculum-directory";

export default async function CurriculumPage() {
  const profile = await requireProfile("super_admin"),
    { data } = await createClient()
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
    <SuperAdminShell name={profile.full_name}>
      <CurriculumDirectory rows={rows} basePath="/dashboard/super-admin" />
    </SuperAdminShell>
  );
}
