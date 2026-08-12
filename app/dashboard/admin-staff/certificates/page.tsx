import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import {
  CertificateManagement,
  type CertificateCourse,
} from "@/components/certificate-management";
export default async function CertificatesPage() {
  const profile = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("courses")
      .select(
        "id,title,organization:organizations(name),instructor:profiles!courses_instructor_id_fkey(full_name),certificate:certificate_templates(id,title,certificate_url,added_at)",
      )
      .order("title");
  const rows: CertificateCourse[] = (data || []).map((x: any) => {
    const c = Array.isArray(x.certificate) ? x.certificate[0] : x.certificate;
    return {
      courseId: x.id,
      course: x.title,
      organization: x.organization?.name || "BGSB",
      instructor: x.instructor?.full_name || "Not assigned",
      templateId: c?.id || null,
      title: c?.title || null,
      url: c?.certificate_url || null,
      addedAt: c?.added_at || null,
    };
  });
  return (
    <StaffPageShell name={profile.full_name}>
      <CertificateManagement initialRows={rows} />
    </StaffPageShell>
  );
}
