import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import {
  InstructorManagement,
  type InstructorRow,
} from "@/components/instructor-management";
export default async function Instructors() {
  const profile = await requireProfile("super_admin"),
    db = createClient(),
    [{ data }, { data: templates }, { data: configuration }] =
      await Promise.all([
        db
          .from("profiles")
          .select(
            "id,full_name,email,phone,whatsapp_number,last_login_at,status,avatar_url",
          )
          .eq("role", "instructor")
          .order("created_at", { ascending: false }),
        db.from("email_templates").select("id,subject").order("subject"),
        db
          .from("email_configuration")
          .select("from_email")
          .eq("id", 1)
          .maybeSingle(),
      ]);
  return (
    <SuperAdminShell name={profile.full_name}>
      <InstructorManagement
        initialRows={(data || []) as InstructorRow[]}
        emailTemplates={templates || []}
        fromEmail={configuration?.from_email || "Not configured"}
      />
    </SuperAdminShell>
  );
}
