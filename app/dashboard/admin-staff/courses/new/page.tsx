import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { CourseBuilder } from "@/components/course-builder";
export default async function AddCourse() {
  const profile = await requireProfile("admin_staff"),
    db = createAdminClient();
  const [{ data: categories }, { data: organizations }, { data: instructors }] =
    await Promise.all([
      db
        .from("categories")
        .select("id,name")
        .eq("is_active", true)
        .order("name"),
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
    ]);
  return (
    <StaffPageShell name={profile.full_name}>
      <CourseBuilder
        categories={categories || []}
        organizations={organizations || []}
        instructors={(instructors || []).map((x) => ({
          id: x.id,
          name: x.full_name,
        }))}
        subjects={[]}
        tags={[]}
      />
    </StaffPageShell>
  );
}
