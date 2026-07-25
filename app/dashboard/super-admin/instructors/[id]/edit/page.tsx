import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import {
  InstructorForm,
  type InstructorValue,
} from "@/components/instructor-form";
export default async function EditInstructor({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("super_admin"),
    db = createClient(),
    [{ data: instructor }, { data: organizations }] = await Promise.all([
      db
        .from("profiles")
        .select(
          "id,first_name,last_name,phone_country_code,phone,email,organization_id,designation,website,expertises,address,country,about,nic_passport,facebook_url,twitter_url,instagram_url,linkedin_url,youtube_url,avatar_url,date_of_birth,gender,education_background,professional_details,resume_url",
        )
        .eq("id", params.id)
        .eq("role", "instructor")
        .single(),
      db
        .from("organizations")
        .select("id,name")
        .eq("status", "active")
        .order("name"),
    ]);
  if (!instructor) notFound();
  return (
    <SuperAdminShell name={profile.full_name}>
      <InstructorForm
        instructor={instructor as InstructorValue}
        organizations={organizations || []}
      />
    </SuperAdminShell>
  );
}
