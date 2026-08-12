import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { StaffPageShell } from "@/components/staff-page-shell";
import { Paperclip } from "lucide-react";
export default async function Page({ params }: { params: { id: string } }) {
  const p = await requireProfile("admin_staff"),
    { data } = await createAdminClient()
      .from("announcements")
      .select("title,body,receiver_types,attachment_url,created_at")
      .eq("id", params.id)
      .single();
  if (!data) notFound();
  return (
    <StaffPageShell name={p.full_name}>
      <p className="text-sm text-slate-400">Announcements / View</p>
      <div className="mt-5 rounded-xl border bg-white p-5 sm:p-8">
        <h1 className="text-2xl font-bold text-navy">{data.title}</h1>
        <p className="mt-2 text-xs text-slate-400">
          {new Date(data.created_at).toLocaleString("en-GB")}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(data.receiver_types || []).map((x: string) => (
            <span
              className="rounded-full bg-blue-50 px-3 py-1 text-xs capitalize text-blue-700"
              key={x}
            >
              {x.replaceAll("_", " ")}
            </span>
          ))}
        </div>
        <div
          className="prose mt-7 max-w-none"
          dangerouslySetInnerHTML={{ __html: data.body || "" }}
        />
        {data.attachment_url && (
          <a
            href={data.attachment_url}
            target="_blank"
            className="mt-7 flex max-w-sm items-center gap-2 rounded-lg border p-3 text-sm font-semibold text-blue-600"
          >
            <Paperclip className="size-4" />
            Open Attachment
          </a>
        )}
      </div>
    </StaffPageShell>
  );
}
