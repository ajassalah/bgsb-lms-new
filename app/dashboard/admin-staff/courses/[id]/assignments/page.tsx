import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function CourseAssignments({
  params,
}: {
  params: { id: string };
}) {
  await requireProfile("admin_staff");
  const { data: module } = await createAdminClient()
    .from("course_modules")
    .select("id")
    .eq("course_id", params.id)
    .order("position")
    .limit(1)
    .maybeSingle();

  redirect(
    module
      ? `/dashboard/admin-staff/courses/${params.id}/curriculum/${module.id}/assignments`
      : `/dashboard/admin-staff/courses/${params.id}/curriculum`,
  );
}
