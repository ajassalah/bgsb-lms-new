import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function Page({ params }: { params: { id: string } }) {
  const p = await requireProfile("student");
  const admin = createAdminClient();
  const { data } = await admin
    .from("support_tickets")
    .select(
      "id,ticket_no,subject,priority,status,description,attachment_url,created_at",
    )
    .eq("id", params.id)
    .eq("created_by", p.id)
    .single();
  if (!data) notFound();
  const { data: links } = await admin
    .from("support_ticket_staff")
    .select("staff_id")
    .eq("ticket_id", data.id);
  const staffIds = (links || []).map((link) => link.staff_id);
  const { data: assistant } = staffIds.length
    ? await admin
        .from("support_assistants")
        .select("role:support_assistant_roles(name)")
        .in("user_id", staffIds)
        .limit(1)
        .maybeSingle()
    : { data: null };
  const { data: replies } = await admin
    .from("support_ticket_replies")
    .select("id,message,attachment_url,created_at")
    .eq("ticket_id", data.id)
    .order("created_at", { ascending: false });
  const roleName =
    ((assistant?.role as { name?: string } | null)?.name as string) || "";
  return (
    <DashboardShell
      role="student"
      name={p.full_name}
      email={p.email}
      avatar={p.avatar_url}
    >
      <p className="text-sm text-slate-400">Support / Tickets / View</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">{data.subject}</h1>
      <section className="mt-7 rounded-2xl border bg-white p-5 sm:p-7">
        <p className="mb-4 text-sm font-bold text-navy">
          Ticket No: {data.ticket_no || params.id.slice(0, 8).toUpperCase()}
        </p>
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
        {(data.status === "answered" || data.status === "closed") && (
          <section className="mt-6 rounded-xl border bg-slate-50 p-4">
            <h2 className="text-sm font-bold text-navy">Response</h2>
            {(replies || []).length ? (
              <div className="mt-3 space-y-4">
                {(replies || []).map((reply) => (
                  <article key={reply.id} className="rounded-lg bg-white p-4">
                    <p className="text-xs text-slate-400">
                      {new Date(reply.created_at).toLocaleString("en-GB")}
                    </p>
                    <div
                      className="prose mt-3 max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: reply.message }}
                    />
                    {reply.attachment_url && (
                      <a
                        href={reply.attachment_url}
                        target="_blank"
                        className="btn-secondary mt-3"
                      >
                        View Response Attachment
                      </a>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                No response has been recorded.
              </p>
            )}
          </section>
        )}
        <div className="mt-6">
          <b className="text-sm text-navy">Role</b>
          <p className="mt-2 text-sm text-slate-500">
            {roleName || "Not assigned"}
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
