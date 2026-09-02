import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function StudentFaqDetails({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireProfile("student");
  const { data } = await createAdminClient()
    .from("support_faqs")
    .select("question,answer,updated_at")
    .eq("id", params.id)
    .eq("status", "active")
    .maybeSingle();
  if (!data) notFound();
  return (
    <DashboardShell
      role="student"
      name={profile.full_name}
      email={profile.email}
      avatar={profile.avatar_url}
    >
      <p className="text-sm text-slate-400">Support / FAQ / View</p>
      <h1 className="mt-1 text-2xl font-bold text-navy">FAQ Details</h1>
      <article className="mt-7 max-w-4xl rounded-2xl border bg-white p-5 sm:p-8">
        <h2 className="text-xl font-bold text-navy">{data.question}</h2>
        <p className="mt-2 text-xs text-slate-400">
          Updated {new Date(data.updated_at).toLocaleString("en-GB")}
        </p>
        <div
          className="prose mt-6 max-w-none text-slate-600"
          dangerouslySetInnerHTML={{ __html: data.answer }}
        />
      </article>
    </DashboardShell>
  );
}
