import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { StudentForm, type StudentFormValue } from "@/components/student-form";
export default async function EditStudent({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("super_admin"),
    { data } = await createClient()
      .from("profiles")
      .select(
        "id,first_name,last_name,address,date_of_birth,gender,country,about,nic_passport,phone_country_code,phone,email,avatar_url,whatsapp_number",
      )
      .eq("id", params.id)
      .eq("role", "student")
      .single();
  if (!data) notFound();
  return (
    <SuperAdminShell name={profile.full_name}>
      <StudentForm student={data as StudentFormValue} />
    </SuperAdminShell>
  );
}
