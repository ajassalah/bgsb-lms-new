import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { InstructorProfileView } from "@/components/instructor-profile-view";

export default async function StaffView({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("super_admin"),
    db = createClient(),
    [{ data: staff }, { data: assignments }] = await Promise.all([
      db
        .from("profiles")
        .select(
          "full_name,first_name,last_name,phone,email,designation,website,expertises,address,country,about,avatar_url,followers_count,following_count,education_background,professional_details,resume_url,organization:organizations(name)",
        )
        .eq("id", params.id)
        .eq("role", "admin_staff")
        .single(),
      db
        .from("live_session_staff")
        .select(
          "session:live_sessions(id,title,thumbnail_url,description,meeting_url,scheduled_start,scheduled_end,live_session_courses(course:courses(id,title,thumbnail_url,status)))",
        )
        .eq("staff_id", params.id),
    ]);
  if (!staff) notFound();
  const value: any = staff,
    liveClasses = (assignments || [])
      .map((assignment: any) => assignment.session)
      .filter(Boolean),
    courses = Array.from(
      new Map(
        liveClasses.flatMap((session: any) =>
          (session.live_session_courses || []).map((entry: any) => [
            entry.course?.id,
            entry.course,
          ]),
        ),
      ).values(),
    ).filter(Boolean) as any[];
  return (
    <SuperAdminShell name={profile.full_name}>
      <InstructorProfileView
        entity="Staff"
        instructor={{
          full_name: staff.full_name,
          first_name: staff.first_name,
          last_name: staff.last_name,
          phone: staff.phone,
          email: staff.email,
          organization: value.organization?.name || "—",
          designation: staff.designation,
          website: staff.website,
          expertises: staff.expertises || [],
          address: staff.address,
          country: staff.country,
          about: staff.about,
          avatar_url: staff.avatar_url,
          followers: staff.followers_count || 0,
          following: staff.following_count || 0,
          education: (staff.education_background as any[]) || [],
          professional: (staff.professional_details as any[]) || [],
          resume_url: staff.resume_url,
        }}
        courses={courses.map((course) => ({
          id: course.id,
          title: course.title,
          thumbnail: course.thumbnail_url,
          status: course.status,
        }))}
        liveClasses={liveClasses.map((session: any) => ({
          id: session.id,
          title: session.title || "Live Class",
          thumbnail: session.thumbnail_url,
          description: session.description || "",
          link: session.meeting_url,
          scheduled_start: session.scheduled_start,
          scheduled_end: session.scheduled_end,
        }))}
      />
    </SuperAdminShell>
  );
}
