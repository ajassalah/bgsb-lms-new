import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import {
  InstructorForm,
  type InstructorValue,
} from "@/components/instructor-form";

export default async function EditStaff({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("super_admin"),
    db = createClient(),
    [{ data: staff }, { data: organizations }, { data: permissionRows }] =
      await Promise.all([
        db
          .from("profiles")
          .select(
            "id,first_name,last_name,phone_country_code,phone,whatsapp_number,email,organization_id,designation,website,expertises,address,country,about,nic_passport,facebook_url,twitter_url,instagram_url,linkedin_url,youtube_url,avatar_url,date_of_birth,gender,education_background,professional_details,resume_url,staff_role",
          )
          .eq("id", params.id)
          .eq("role", "admin_staff")
          .single(),
        db
          .from("organizations")
          .select("id,name")
          .eq("status", "active")
          .order("name"),
        db
          .from("admin_permissions")
          .select("module,can_view,can_create,can_edit,can_delete")
          .eq("admin_staff_id", params.id),
      ]);
  if (!staff) notFound();
  return (
    <SuperAdminShell name={profile.full_name}>
      <InstructorForm
        instructor={staff as InstructorValue}
        organizations={organizations || []}
        entity="Staff"
        basePath="/dashboard/super-admin/staff"
        profileRole="admin_staff"
        initialPermissions={Object.fromEntries(
          (permissionRows || []).map((row) => [
            row.module,
            {
              view: row.can_view,
              create: row.can_create,
              edit: row.can_edit,
              delete: row.can_delete,
            },
          ]),
        )}
      />
    </SuperAdminShell>
  );
}
