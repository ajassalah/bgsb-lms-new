import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import {
  StudentManagement,
  type StudentRow,
} from "@/components/student-management";
export default async function Students() {
  const profile = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("profiles")
      .select(
        "id,full_name,email,phone,country,status,avatar_url,enrollments!enrollments_student_id_fkey(count)",
      )
      .eq("role", "student")
      .order("created_at", { ascending: false });
  const rows: StudentRow[] = (data || []).map((x: any) => ({
    ...x,
    enrolledCount: x.enrollments?.[0]?.count || 0,
  }));
  return (
    <SuperAdminShell name={profile.full_name}>
      <StudentManagement initialStudents={rows} />
    </SuperAdminShell>
  );
}
