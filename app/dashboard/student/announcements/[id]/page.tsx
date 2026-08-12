import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function StudentAnnouncementView({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("student");
  const now = new Date().toISOString();
  const { data } = await createAdminClient()
    .from("announcements")
    .select("title,body,created_at,scheduled_at,attachment_url")
    .eq("id", params.id)
    .contains("receiver_types", ["student"])
    .or(`scheduled_at.is.null,scheduled_at.lte.${now}`)
    .maybeSingle();
  if (!data) notFound();
  return (
    <DashboardShell
      role="student"
      name={profile.full_name}
      email={profile.email}
      avatar={profile.avatar_url}
    >
      <p className="text-sm text-slate-400">Announcements / View</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">{data.title}</h1>
      <article className="mt-7 rounded-2xl border bg-white p-5 sm:p-8">
        <p className="text-xs font-semibold text-slate-400">
          {new Date(data.scheduled_at || data.created_at).toLocaleString(
            "en-GB",
          )}
        </p>
        <div
          className="prose mt-5 max-w-none text-slate-600"
          dangerouslySetInnerHTML={{ __html: data.body || "" }}
        />
        {data.attachment_url && (
          <a href={data.attachment_url} download className="btn-secondary mt-6">
            Download Attachment
          </a>
        )}
      </article>
    </DashboardShell>
  );
}
