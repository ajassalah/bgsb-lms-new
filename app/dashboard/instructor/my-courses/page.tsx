import { DashboardShell } from "@/components/dashboard-shell";
import { InstructorCourseList } from "@/components/instructor-course-list";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function MyCourses() {
  const profile = await requireProfile("instructor"),
    admin = createAdminClient(),
    { data: links } = await admin
      .from("course_instructors")
      .select("course_id")
      .eq("instructor_id", profile.id),
    ids = (links || []).map((x) => x.course_id);
  const { data } = ids.length
    ? await admin
        .from("courses")
        .select("id,title,status,category:categories(name),enrollments(count)")
        .in("id", ids)
        .order("title")
    : { data: [] };
  return (
    <DashboardShell role="instructor" name={profile.full_name}>
      <InstructorCourseList
        courses={(data || []).map((x: any) => ({
          id: x.id,
          title: x.title,
          category: x.category?.name || "Uncategorized",
          students: x.enrollments?.[0]?.count || 0,
          status: x.status,
        }))}
      />
    </DashboardShell>
  );
}
