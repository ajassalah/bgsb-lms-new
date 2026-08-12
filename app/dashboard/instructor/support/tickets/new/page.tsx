import { DashboardShell } from "@/components/dashboard-shell";
import { InstructorTicketForm } from "@/components/instructor-ticket-form";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function Page() {
  const p = await requireProfile("instructor"),
    { data } = await createAdminClient()
      .from("profiles")
      .select("id,full_name,email,avatar_url")
      .eq("role", "admin_staff")
      .eq("status", "active")
      .order("full_name");
  return (
    <DashboardShell role="instructor" name={p.full_name}>
      <InstructorTicketForm
        staff={(data || []).map((x) => ({
          id: x.id,
          name: x.full_name,
          email: x.email,
          avatar: x.avatar_url,
        }))}
      />
    </DashboardShell>
  );
}
