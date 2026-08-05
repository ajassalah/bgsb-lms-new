import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { InstructorProfileView } from "@/components/instructor-profile-view";
export default async function InstructorView({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("super_admin"),
    db = createClient(),
    [{ data: i }, { data: courses }, { data: live }] = await Promise.all([
      db
        .from("profiles")
        .select(
          "full_name,first_name,last_name,phone,email,designation,website,expertises,address,country,about,avatar_url,followers_count,following_count,education_background,professional_details,resume_url,organization:organizations(name)",
        )
        .eq("id", params.id)
        .eq("role", "instructor")
        .single(),
      db
        .from("courses")
        .select("id,title,thumbnail_url,status")
        .eq("instructor_id", params.id)
        .order("created_at", { ascending: false }),
      db
        .from("live_session_instructors")
        .select(
          "session:live_sessions(id,title,thumbnail_url,description,meeting_url,scheduled_start,scheduled_end)",
        )
        .eq("instructor_id", params.id),
    ]);
  if (!i) notFound();
  const instructor: any = i;
  return (
    <SuperAdminShell name={profile.full_name}>
      <InstructorProfileView
        instructor={{
          full_name: i.full_name,
          first_name: i.first_name,
          last_name: i.last_name,
          phone: i.phone,
          email: i.email,
          organization: instructor.organization?.name || "—",
          designation: i.designation,
          website: i.website,
          expertises: i.expertises || [],
          address: i.address,
          country: i.country,
          about: i.about,
          avatar_url: i.avatar_url,
          followers: i.followers_count || 0,
          following: i.following_count || 0,
          education: (i.education_background as any[]) || [],
          professional: (i.professional_details as any[]) || [],
          resume_url: i.resume_url,
        }}
        courses={(courses || []).map((x) => ({
          id: x.id,
          title: x.title,
          thumbnail: x.thumbnail_url,
          status: x.status,
        }))}
        liveClasses={(live || []).map((x: any) => ({
          id: x.session?.id,
          title: x.session?.title || "Live Class",
          thumbnail: x.session?.thumbnail_url,
          description: x.session?.description || "",
          link: x.session?.meeting_url,
          scheduled_start: x.session?.scheduled_start,
          scheduled_end: x.session?.scheduled_end,
        }))}
      />
    </SuperAdminShell>
  );
}
