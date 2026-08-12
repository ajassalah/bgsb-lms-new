import { notFound } from "next/navigation";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { AssignmentStudentOverview } from "@/components/assignment-student-overview";
import { requireProfile } from "@/lib/auth";
import { loadAssignmentStudent } from "@/lib/assignment-student";

export default async function AdminAssignmentStudentPage({ params }: { params: { courseId: string; studentId: string } }) {
  const profile = await requireProfile("super_admin");
  const view = await loadAssignmentStudent(params.courseId, params.studentId);
  if (!view) notFound();
  return <SuperAdminShell name={profile.full_name}><AssignmentStudentOverview {...view} courseId={params.courseId} studentId={params.studentId} basePath="/dashboard/super-admin/assignments" /></SuperAdminShell>;
}
