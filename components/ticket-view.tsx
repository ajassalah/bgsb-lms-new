import { CalendarClock, Flag, Hash, LifeBuoy, ShieldCheck, UserRound } from "lucide-react";
import {
  AttachmentLink,
  DetailBody,
  DetailList,
  DetailPage,
  DetailSection,
  Lozenge,
  formatDate,
} from "@/components/portal/object-detail";

type Reply = {
  id: string;
  message: string;
  attachment_url?: string | null;
  created_at: string;
};

const statusTone = (status: string) =>
  status === "closed"
    ? "success"
    : status === "answered"
      ? "new"
      : status === "open"
        ? "inprogress"
        : "moved";

export function TicketView({
  ticket,
  fallbackNo,
  roleName,
  createdBy,
  replies,
  backHref,
  actions,
}: {
  ticket: {
    ticket_no?: string | null;
    subject: string;
    priority: string;
    status: string;
    description: string | null;
    attachment_url?: string | null;
    created_at: string;
  };
  fallbackNo: string;
  roleName: string;
  createdBy?: string;
  replies?: Reply[] | null;
  backHref: string;
  actions?: React.ReactNode;
}) {
  const number = ticket.ticket_no || fallbackNo.slice(0, 8).toUpperCase();
  return (
    <DetailPage
      title={ticket.subject}
      icon={LifeBuoy}
      status={<Lozenge value={ticket.status} tone={statusTone(ticket.status)} />}
      meta={
        <span>
          {number} · Created {formatDate(ticket.created_at, true)}
        </span>
      }
      back={{ href: backHref, label: "Back to tickets" }}
      actions={actions}
      aside={
        <>
          <DetailSection title="Details">
            <DetailList
              compact
              items={[
                { label: "Ticket no", value: number, icon: Hash },
                {
                  label: "Status",
                  value: <Lozenge value={ticket.status} tone={statusTone(ticket.status)} />,
                  icon: ShieldCheck,
                },
                { label: "Priority", value: <Lozenge value={ticket.priority} />, icon: Flag },
                { label: "Assigned role", value: roleName || "Not assigned", icon: ShieldCheck },
                ...(createdBy ? [{ label: "Created by", value: createdBy, icon: UserRound }] : []),
                { label: "Created", value: formatDate(ticket.created_at, true), icon: CalendarClock },
              ]}
            />
          </DetailSection>
          {ticket.attachment_url && (
            <DetailSection title="Attachment">
              <AttachmentLink href={ticket.attachment_url} label="View attachment" />
            </DetailSection>
          )}
        </>
      }
    >
      <DetailSection title="Description">
        <DetailBody html={ticket.description} />
      </DetailSection>
      {replies && (
        <DetailSection
          title="Responses"
          description={replies.length ? `${replies.length} response${replies.length === 1 ? "" : "s"}` : undefined}
          flush
        >
          {replies.length ? (
            <ol className="divide-y divide-[#DFE1E6]">
              {replies.map((reply) => (
                <li key={reply.id} className="flex gap-3 px-5 py-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#DEEBFF] text-[#0052CC]">
                    <LifeBuoy className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <b className="font-semibold text-[#172B4D]">Support team</b>
                      <span className="ml-2 text-xs text-[#6B778C]">
                        {formatDate(reply.created_at, true)}
                      </span>
                    </p>
                    <div className="mt-1.5">
                      <DetailBody html={reply.message} />
                    </div>
                    {reply.attachment_url && (
                      <div className="mt-3 max-w-sm">
                        <AttachmentLink href={reply.attachment_url} label="Response attachment" />
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="px-5 py-4 text-sm text-[#6B778C]">No response has been recorded yet.</p>
          )}
        </DetailSection>
      )}
    </DetailPage>
  );
}
