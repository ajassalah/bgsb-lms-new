import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import {
  StudentManagement,
  type StudentRow,
} from "@/components/student-management";
export default async function Students() {
  const profile = await requireProfile("super_admin"),
    db = createClient(),
    [{ data }, { data: templates }, { data: configuration }] =
      await Promise.all([
        db
          .from("profiles")
          .select(
            "id,full_name,email,phone,whatsapp_number,country,status,avatar_url,verification_status,verified_as,verified_at,enrollments!enrollments_student_id_fkey(count)",
          )
          .eq("role", "student")
          .order("created_at", { ascending: false }),
        db.from("email_templates").select("id,subject").order("subject"),
        db
          .from("email_configuration")
          .select("from_email")
          .eq("id", 1)
          .maybeSingle(),
      ]);
  const rows: StudentRow[] = (data || []).map((x: any) => ({
    ...x,
    enrolledCount: x.enrollments?.[0]?.count || 0,
  }));
  return (
    <SuperAdminShell name={profile.full_name}>
      <StudentManagement
        initialStudents={rows}
        emailTemplates={templates || []}
        fromEmail={configuration?.from_email || "Not configured"}
      />
    </SuperAdminShell>
  );
}
