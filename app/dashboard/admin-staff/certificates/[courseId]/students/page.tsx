import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { CertificateStudentManagement } from "@/components/certificate-student-management";

export default async function ManageCertificateStudents({
  params,
}: {
  params: { courseId: string };
}) {
  const profile = await requireProfile("admin_staff"),
    admin = createAdminClient();
  const [
    { data: course },
    { data: template },
    { data: enrollments },
    { data: certificates },
    { data: verifications },
  ] = await Promise.all([
    admin
      .from("courses")
      .select("title")
      .eq("id", params.courseId)
      .maybeSingle(),
    admin
      .from("certificate_templates")
      .select("id")
      .eq("course_id", params.courseId)
      .maybeSingle(),
    admin
      .from("enrollments")
      .select(
        "student:profiles!enrollments_student_id_fkey(id,full_name,email,avatar_url)",
      )
      .eq("course_id", params.courseId)
      .in("status", ["approved", "completed"]),
    admin
      .from("certificates")
      .select("id,student_id,issued_at")
      .eq("course_id", params.courseId),
    admin
      .from("certificate_verifications")
      .select("student_id,status")
      .eq("course_id", params.courseId),
  ]);
  if (!course) notFound();
  const issued = new Map(
    (certificates || []).map((item) => [item.student_id, item]),
  );
  const verification = new Map(
    (verifications || []).map((item) => [item.student_id, item.status]),
  );
  return (
    <StaffPageShell name={profile.full_name}>
      <CertificateStudentManagement
        courseId={params.courseId}
        courseTitle={course.title}
        templateReady={!!template}
        initialStudents={(enrollments || [])
          .map((row: any) => {
            const certificate = issued.get(row.student?.id) as any;
            return {
              id: row.student?.id,
              name: row.student?.full_name || "Student",
              email: row.student?.email || "",
              avatar: row.student?.avatar_url || null,
              certificateId: certificate?.id || null,
              issuedAt: certificate?.issued_at || null,
              verificationStatus: verification.get(row.student?.id) || null,
            };
          })
          .filter((item: any) => item.id)}
      />
    </StaffPageShell>
  );
}
