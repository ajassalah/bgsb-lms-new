import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function Page({ params }: { params: { id: string } }) {
  const p = await requireProfile("instructor"),
    { data } = await createAdminClient()
      .from("support_tickets")
      .select(
        "subject,priority,status,description,attachment_url,created_at,support_ticket_staff(staff:profiles!support_ticket_staff_staff_id_fkey(full_name,email))",
      )
      .eq("id", params.id)
      .eq("created_by", p.id)
      .single();
  if (!data) notFound();
  return (
    <DashboardShell role="instructor" name={p.full_name}>
      <p className="text-sm text-slate-400">Support / Tickets / View</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">{data.subject}</h1>
      <section className="mt-7 rounded-2xl border bg-white p-5 sm:p-7">
        <div className="flex flex-wrap gap-3">
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold capitalize text-amber-700">
            {data.priority}
          </span>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-blue-700">
            {data.status.replace("_", " ")}
          </span>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Created {new Date(data.created_at).toLocaleString("en-GB")}
        </p>
        <div
          className="prose mt-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: data.description }}
        />
        <div className="mt-6">
          <b className="text-sm text-navy">Assigned Staff</b>
          <p className="mt-2 text-sm text-slate-500">
            {(data.support_ticket_staff || [])
              .map((x: any) => x.staff?.full_name)
              .filter(Boolean)
              .join(", ") || "Not assigned"}
          </p>
        </div>
        {data.attachment_url && (
          <a
            href={data.attachment_url}
            target="_blank"
            className="btn-secondary mt-6"
          >
            View Attachment
          </a>
        )}
      </section>
    </DashboardShell>
  );
}
