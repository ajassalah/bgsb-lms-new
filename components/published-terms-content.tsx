import Link from "next/link";
import { ExternalLink, ScrollText } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PublishedTermsContent() {
  const { data } = await createAdminClient()
    .from("legal_terms")
    .select("title,version,content,effective_date,updated_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Platform / Legal</p>
          <h1 className="mt-1 text-2xl font-bold text-navy dark:text-white">
            Terms & Conditions
          </h1>
        </div>
        <Link
          href="/terms-and-conditions"
          target="_blank"
          className="btn-secondary gap-2"
        >
          <ExternalLink className="size-4" /> Open Full Page
        </Link>
      </div>
      <article className="mt-6 rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8">
        <span className="grid size-11 place-items-center rounded-xl bg-red/10 text-red">
          <ScrollText className="size-5" />
        </span>
        <h2 className="mt-4 text-2xl font-black text-navy dark:text-white">
          {data?.title || "Terms & Conditions"}
        </h2>
        {data && (
          <p className="mt-2 text-sm text-slate-500">
            Version {data.version} · Effective{" "}
            {new Date(data.effective_date).toLocaleDateString("en-GB")} · Last
            updated {new Date(data.updated_at).toLocaleDateString("en-GB")}
          </p>
        )}
        {data ? (
          <div
            className="prose prose-slate mt-7 max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        ) : (
          <p className="mt-7 rounded-xl border border-dashed p-8 text-center text-slate-400">
            Terms & Conditions have not been published yet.
          </p>
        )}
      </article>
    </div>
  );
}
