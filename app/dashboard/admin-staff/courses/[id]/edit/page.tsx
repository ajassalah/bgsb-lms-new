import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { CourseEditForm } from "@/components/course-edit-form";
export default async function EditCourse({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("admin_staff"),
    db = createAdminClient();
  const [
    { data: course },
    { data: categories },
    { data: organizations },
    { data: instructors },
    { data: assigned },
  ] = await Promise.all([
    db.from("courses").select("*").eq("id", params.id).single(),
    db.from("categories").select("id,name").eq("is_active", true).order("name"),
    db
      .from("organizations")
      .select("id,name")
      .eq("status", "active")
      .order("name"),
    db
      .from("profiles")
      .select("id,full_name")
      .eq("role", "instructor")
      .eq("status", "active")
      .order("full_name"),
    db
      .from("course_instructors")
      .select("instructor_id")
      .eq("course_id", params.id),
  ]);
  if (!course) notFound();
  return (
    <StaffPageShell name={profile.full_name}>
      <CourseEditForm
        course={{
          ...course,
          instructor_ids: (assigned || []).map((x) => x.instructor_id),
        }}
        categories={categories || []}
        organizations={organizations || []}
        instructors={(instructors || []).map((x) => ({
          id: x.id,
          name: x.full_name,
        }))}
      />
    </StaffPageShell>
  );
}
