import { CalendarCheck, FileText, History, Tag } from "lucide-react";
import { TermsReturnButton } from "@/components/terms-return-button";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const decode = (value: string) =>
  value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

/** Gives h2/h3 headings stable ids and returns them as a table of contents. */
function withAnchors(html: string) {
  const toc: { id: string; text: string; level: number }[] = [];
  let index = 0;
  const output = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, level: string, attrs: string, inner: string) => {
      const text = decode(inner);
      if (!text) return match;
      const id = `section-${++index}`;
      toc.push({ id, text, level: Number(level) });
      return `<h${level}${attrs.replace(/\sid="[^"]*"/i, "")} id="${id}">${inner}</h${level}>`;
    },
  );
  return { html: output, toc };
}

export default async function TermsAndConditionsPage() {
  const { data } = await createAdminClient()
    .from("legal_terms")
    .select("title,version,content,effective_date,updated_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const details = data
    ? ([
        ["Version", data.version, Tag],
        ["Effective", formatDate(data.effective_date), CalendarCheck],
        ["Last updated", formatDate(data.updated_at), History],
      ] as const)
    : [];
  const document = data ? withAnchors(data.content || "") : { html: "", toc: [] };

  return (
    <main className="ds-public ds-terms bg-white text-[#172B4D]">
      <section className="ds-hero border-b border-[#DFE1E6] bg-gradient-to-b from-[#DEEBFF] via-[#F4F8FF] to-white px-4 pb-10 pt-12 sm:px-6 md:pb-12 md:pt-16">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <nav aria-label="Breadcrumb" className="text-sm text-[#6B778C]">
              <a href="/" className="hover:text-[#0052CC] hover:underline">
                Home
              </a>
              <span aria-hidden className="px-1.5 text-[#97A0AF]">
                /
              </span>
              <span>Legal information</span>
            </nav>
            <h1 className="mt-3 text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-[#172B4D] md:text-[44px]">
              {data?.title || "Terms & Conditions"}
            </h1>
            {data && (
              <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[#6B778C]">
                <span className="ds-lozenge bg-[#DEEBFF] text-[#0747A6]">Version {data.version}</span>
                <span>Effective {formatDate(data.effective_date)}</span>
                <span aria-hidden>·</span>
                <span>Updated {formatDate(data.updated_at)}</span>
              </p>
            )}
          </div>
          <TermsReturnButton />
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 md:py-14">
        <div className="mx-auto grid max-w-[1200px] items-start gap-6 lg:grid-cols-[17rem_1fr] lg:gap-10">
          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="ds-card rounded-[3px] bg-white p-5 shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-[3px] bg-[#DEEBFF] text-[#0052CC]">
                  <FileText className="size-5" />
                </span>
                <span className="min-w-0">
                  <b className="block text-sm font-semibold text-[#172B4D]">BGSB LMS</b>
                  <span className="block text-xs text-[#6B778C]">Terms &amp; Conditions</span>
                </span>
              </div>
              {details.length > 0 && (
                <dl className="mt-4 divide-y divide-[#DFE1E6] border-t border-[#DFE1E6]">
                  {details.map(([label, value, Icon]) => (
                    <div className="flex items-center gap-2.5 py-2.5" key={label}>
                      <Icon className="size-4 shrink-0 text-[#6B778C]" />
                      <dt className="text-sm text-[#6B778C]">{label}</dt>
                      <dd className="ml-auto text-sm font-medium text-[#172B4D]">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
            {document.toc.length > 1 && (
              <nav
                aria-label="On this page"
                className="hidden rounded-[3px] lg:block"
              >
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6B778C]">
                  On this page
                </p>
                <ul className="ds-scroll max-h-[50vh] space-y-0.5 overflow-y-auto border-l-2 border-[#DFE1E6]">
                  {document.toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className={`-ml-0.5 block border-l-2 border-transparent py-1 pr-2 text-sm leading-5 text-[#42526E] hover:border-[#0052CC] hover:text-[#0052CC] ${item.level === 3 ? "pl-6" : "pl-3"}`}
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </aside>

          <article className="ds-card min-w-0 rounded-[3px] bg-white p-6 shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)] sm:p-10">
            {data ? (
              <div
                className="legal-terms-content legal-prose"
                dangerouslySetInnerHTML={{ __html: document.html }}
              />
            ) : (
              <div className="py-12 text-center">
                <FileText className="mx-auto size-8 text-[#97A0AF]" />
                <p className="mt-3 text-base font-medium text-[#172B4D]">
                  Terms &amp; Conditions haven&apos;t been published yet
                </p>
                <p className="mt-1 text-sm text-[#6B778C]">Please check back later.</p>
              </div>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
