import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function Page({ params }: { params: { id: string } }) {
  const p = await requireProfile("instructor"),
    { data } = await createAdminClient()
      .from("announcements")
      .select("title,body,created_at,attachment_url")
      .eq("id", params.id)
      .single();
  if (!data) notFound();
  return (
    <DashboardShell role="instructor" name={p.full_name}>
      <p className="text-sm text-slate-400">Announcements / View</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">{data.title}</h1>
      <article className="mt-7 rounded-2xl border bg-white p-5 sm:p-8">
        <p className="text-xs font-semibold text-slate-400">
          {new Date(data.created_at).toLocaleString("en-GB")}
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
