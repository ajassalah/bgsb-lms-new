import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { SupportTicketReplyForm } from "@/components/support-ticket-reply-form";

export default async function TicketReplyPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { status?: string };
}) {
  const profile = await requireProfile("admin_staff"),
    { data: ticket } = await createAdminClient()
      .from("support_tickets")
      .select("id,subject,priority")
      .eq("id", params.id)
      .single();
  if (!ticket) notFound();
  return (
    <StaffPageShell name={profile.full_name}>
      <SupportTicketReplyForm
        ticket={
          ticket as {
            id: string;
            subject: string;
            priority: "low" | "medium" | "high";
          }
        }
        initialStatus={searchParams.status === "closed" ? "closed" : "answered"}
      />
    </StaffPageShell>
  );
}
