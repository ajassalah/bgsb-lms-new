import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function Page({ params }: { params: { id: string } }) {
  const profile = await requireProfile("instructor"),
    { data } = await createAdminClient()
      .from("support_faqs")
      .select(
        "question,answer,created_at,creator:profiles!support_faqs_created_by_fkey(full_name)",
      )
      .eq("id", params.id)
      .eq("status", "active")
      .single();
  if (!data) notFound();
  return (
    <DashboardShell role="instructor" name={profile.full_name}>
      <p className="text-sm text-slate-400">Support / FAQ / View</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">FAQ Details</h1>
      <article className="mt-7 rounded-2xl border bg-white p-5 sm:p-8">
        <h2 className="text-xl font-bold text-navy">{data.question}</h2>
        <p className="mt-2 text-xs text-slate-400">
          Created by {(data.creator as any)?.full_name || "Staff"} ·{" "}
          {new Date(data.created_at).toLocaleString("en-GB")}
        </p>
        <div
          className="prose mt-6 max-w-none text-slate-600"
          dangerouslySetInnerHTML={{ __html: data.answer }}
        />
      </article>
    </DashboardShell>
  );
}
