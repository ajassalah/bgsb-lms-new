import { CalendarClock, Megaphone, Users } from "lucide-react";
import {
  AttachmentLink,
  DetailBody,
  DetailList,
  DetailPage,
  DetailSection,
  formatDate,
} from "@/components/portal/object-detail";

export function AnnouncementView({
  data,
  backHref,
}: {
  data: {
    title: string;
    body: string | null;
    created_at: string;
    scheduled_at?: string | null;
    receiver_types?: string[] | null;
    attachment_url?: string | null;
  };
  backHref: string;
}) {
  const published = data.scheduled_at || data.created_at;
  const audience = data.receiver_types || [];
  return (
    <DetailPage
      title={data.title}
      icon={Megaphone}
      meta={<span>Published {formatDate(published, true)}</span>}
      back={{ href: backHref, label: "Back to announcements" }}
      aside={
        <>
          <DetailSection title="Details">
            <DetailList
              compact
              items={[
                { label: "Published", value: formatDate(published, true), icon: CalendarClock },
                ...(audience.length
                  ? [
                      {
                        label: "Audience",
                        icon: Users,
                        value: (
                          <span className="flex flex-wrap gap-1.5">
                            {audience.map((type) => (
                              <span
                                key={type}
                                className="rounded-[3px] bg-[#091E420F] px-1.5 py-0.5 text-xs font-medium capitalize text-[#42526E]"
                              >
                                {type.replaceAll("_", " ")}
                              </span>
                            ))}
                          </span>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </DetailSection>
          {data.attachment_url && (
            <DetailSection title="Attachment">
              <AttachmentLink href={data.attachment_url} label="Open attachment" />
            </DetailSection>
          )}
        </>
      }
    >
      <DetailSection>
        <DetailBody html={data.body} />
      </DetailSection>
    </DetailPage>
  );
}
