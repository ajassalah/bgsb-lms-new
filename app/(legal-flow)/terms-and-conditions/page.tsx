import { CalendarCheck, FileText, History, Tag } from "lucide-react";
import { TermsReturnButton } from "@/components/terms-return-button";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function TermsAndConditionsPage() {
  const { data } = await createAdminClient()
    .from("legal_terms")
    .select("title,version,content,effective_date,updated_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const details = data
    ? ([
        ["Version", data.version, Tag],
        [
          "Effective",
          new Date(data.effective_date).toLocaleDateString("en-GB"),
          CalendarCheck,
        ],
        [
          "Last updated",
          new Date(data.updated_at).toLocaleDateString("en-GB"),
          History,
        ],
      ] as const)
    : [];
  return (
    <main className="landing">
      <section className="landing-hero relative overflow-hidden bg-gradient-to-b from-white to-cream px-6 pb-16 pt-20 md:pb-20 md:pt-28">
        <div className="landing-grid absolute inset-0" />
        <div className="absolute -left-40 top-10 size-[28rem] rounded-full bg-red/10 blur-[120px]" />
        <div className="landing-rise relative mx-auto flex max-w-[77rem] flex-wrap items-end justify-between gap-8">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-3 rounded-full border border-red/15 bg-red/5 px-4 py-2 text-xs font-bold uppercase tracking-[.25em] text-red">
              <span className="size-1.5 rounded-full bg-red" />
              Legal Information
            </p>
            <h1 className="mt-7 text-5xl font-bold leading-[1.05] tracking-tight text-navy md:text-6xl">
              {data?.title || "Terms & Conditions"}
            </h1>
          </div>
          <TermsReturnButton />
        </div>
      </section>
      <section className="px-6 pb-24 md:pb-32">
        <div className="mx-auto grid max-w-[77rem] items-start gap-6 lg:grid-cols-[18rem_1fr] lg:gap-10">
          <aside className="card p-6 lg:sticky lg:top-28">
            <span className="grid size-12 place-items-center rounded-2xl bg-red/10 text-red">
              <FileText className="size-5" />
            </span>
            <p className="mt-5 font-bold text-navy">BGS-LMS</p>
            {details.length > 0 && (
              <dl className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
                {details.map(([label, value, Icon]) => (
                  <div className="flex items-center gap-3 py-3" key={label}>
                    <Icon className="size-4 shrink-0 text-red" />
                    <dt className="text-sm text-slate-500">{label}</dt>
                    <dd className="ml-auto text-sm font-semibold text-navy">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </aside>
          <article className="card p-6 sm:p-10 lg:p-12">
            {data ? (
              <div
                className="legal-terms-content legal-prose"
                dangerouslySetInnerHTML={{ __html: data.content }}
              />
            ) : (
              <p className="rounded-xl border border-dashed p-8 text-center text-slate-400">
                Terms & Conditions have not been published yet.
              </p>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
