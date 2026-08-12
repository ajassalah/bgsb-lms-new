import { DashboardShell } from "@/components/dashboard-shell";
import { requireProfile } from "@/lib/auth";

const titles: Record<string, string> = {
  "my-courses": "My Courses",
  "my-students": "My Students",
  "live-classes": "Live Classes",
  assignments: "Assignment",
  certificates: "Certificate",
  announcements: "Announcement",
  calendar: "Calendar",
  messages: "Messages",
  reports: "Reports",
  "support/tickets": "Support Tickets",
  "support/faq": "Frequently Asked Questions",
  "support/help": "Help & Support",
};

export default async function InstructorSection({
  params,
}: {
  params: { section: string[] };
}) {
  const profile = await requireProfile("instructor");
  const key = params.section.join("/");
  const title = titles[key] || "Instructor Portal";

  return (
    <DashboardShell role="instructor" name={profile.full_name}>
      <div>
        <p className="text-sm text-slate-400">Instructor Portal</p>
        <h1 className="mt-1 text-2xl font-bold text-navy">{title}</h1>
      </div>
      <section className="mt-7 rounded-2xl border bg-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-bold text-navy">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">
          Your assigned {title.toLowerCase()} will appear here.
        </p>
      </section>
    </DashboardShell>
  );
}
