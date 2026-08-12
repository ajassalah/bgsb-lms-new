import { notFound } from "next/navigation";
import { StaffPageShell } from "@/components/staff-page-shell";
import { AssignmentStudentOverview } from "@/components/assignment-student-overview";
import { requireProfile } from "@/lib/auth";
import { loadAssignmentStudent } from "@/lib/assignment-student";

export default async function AdminAssignmentStudentPage({
  params,
}: {
  params: { courseId: string; studentId: string };
}) {
  const profile = await requireProfile("admin_staff");
  const view = await loadAssignmentStudent(params.courseId, params.studentId);
  if (!view) notFound();
  return (
    <StaffPageShell name={profile.full_name}>
      <AssignmentStudentOverview
        {...view}
        courseId={params.courseId}
        studentId={params.studentId}
        basePath="/dashboard/admin-staff/assignments"
      />
    </StaffPageShell>
  );
}
