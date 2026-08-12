import { notFound } from "next/navigation";
import { StaffPageShell } from "@/components/staff-page-shell";
import { ModuleStudentAssignments } from "@/components/module-student-assignments";
import { requireProfile } from "@/lib/auth";
import { loadModuleStudentAssignments } from "@/lib/module-student-assignments";
export default async function Page({
  params,
}: {
  params: { courseId: string; studentId: string; moduleId: string };
}) {
  const p = await requireProfile("admin_staff"),
    data = await loadModuleStudentAssignments(
      params.courseId,
      params.moduleId,
      params.studentId,
    );
  if (!data) notFound();
  return (
    <StaffPageShell name={p.full_name}>
      <ModuleStudentAssignments
        courseTitle={data.courseTitle}
        moduleTitle={data.moduleTitle}
        studentId={params.studentId}
        studentName={data.studentName}
        initialRows={data.rows}
      />
    </StaffPageShell>
  );
}
