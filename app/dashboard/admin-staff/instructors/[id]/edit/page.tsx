import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import {
  InstructorForm,
  type InstructorValue,
} from "@/components/instructor-form";
export default async function EditInstructor({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("admin_staff"),
    db = createAdminClient(),
    [{ data: instructor }, { data: organizations }] = await Promise.all([
      db
        .from("profiles")
        .select(
          "id,first_name,last_name,phone_country_code,phone,whatsapp_number,email,organization_id,designation,website,expertises,address,country,about,nic_passport,facebook_url,twitter_url,instagram_url,linkedin_url,youtube_url,avatar_url,date_of_birth,gender,education_background,professional_details,resume_url",
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
    <StaffPageShell name={profile.full_name}>
      <InstructorForm
        instructor={instructor as InstructorValue}
        organizations={organizations || []}
      />
    </StaffPageShell>
  );
}
