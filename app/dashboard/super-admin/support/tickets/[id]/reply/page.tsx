import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SuperAdminShell } from "@/components/super-admin-shell";
import { SupportTicketReplyForm } from "@/components/support-ticket-reply-form";

export default async function TicketReplyPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { status?: string };
}) {
  const profile = await requireProfile("super_admin"),
    { data: ticket } = await createClient()
      .from("support_tickets")
      .select("id,subject,priority")
      .eq("id", params.id)
      .single();
  if (!ticket) notFound();
  return (
    <SuperAdminShell name={profile.full_name}>
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
    </SuperAdminShell>
  );
}
