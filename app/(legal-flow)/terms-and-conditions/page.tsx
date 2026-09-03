import { FileText } from "lucide-react";
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
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 dark:bg-slate-950 sm:px-6 sm:py-10">
      <header className="mx-auto mb-5 flex max-w-4xl flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center overflow-hidden rounded-xl bg-white p-1">
            <img
              src="/bgs%20logo.png"
              alt="BGSB"
              className="size-full object-contain"
            />
          </span>
          <div>
            <b className="block text-navy dark:text-white">BGS-LMS</b>
            <small className="text-slate-400">Legal Information</small>
          </div>
        </div>
        <TermsReturnButton />
      </header>
      <article className="mx-auto max-w-4xl rounded-3xl border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-10">
        <span className="grid size-12 place-items-center rounded-2xl bg-red/10 text-red">
          <FileText className="size-6" />
        </span>
        <h1 className="mt-5 text-3xl font-black text-navy dark:text-white">
          {data?.title || "Terms & Conditions"}
        </h1>
        {data && (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Version {data.version} · Effective{" "}
            {new Date(data.effective_date).toLocaleDateString("en-GB")} · Last
            updated {new Date(data.updated_at).toLocaleDateString("en-GB")}
          </p>
        )}
        {data ? (
          <div
            className="prose prose-slate mt-8 max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        ) : (
          <p className="mt-8 rounded-xl border border-dashed p-8 text-center text-slate-400">
            Terms & Conditions have not been published yet.
          </p>
        )}
      </article>
    </main>
  );
}
