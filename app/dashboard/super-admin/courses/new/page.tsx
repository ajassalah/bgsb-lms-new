import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { CourseBuilder } from "@/components/course-builder";
export default async function AddCourse() {
  const profile = await requireProfile("super_admin"),
    db = createClient();
  const [{ data: categories }, { data: instructors }, { data: courseTags }] =
    await Promise.all([
      db
        .from("categories")
        .select("id,name")
        .eq("is_active", true)
        .order("name"),
      db
        .from("profiles")
        .select("id,full_name")
        .eq("role", "instructor")
        .eq("status", "active")
        .order("full_name"),
      db.from("courses").select("tags"),
    ]);
  return (
    <SuperAdminShell name={profile.full_name}>
      <CourseBuilder
        categories={categories || []}
        instructors={(instructors || []).map((x) => ({
          id: x.id,
          name: x.full_name,
        }))}
        subjects={[]}
        tags={Array.from(
          new Set((courseTags || []).flatMap((course) => course.tags || [])),
        ).sort()}
      />
    </SuperAdminShell>
  );
}
