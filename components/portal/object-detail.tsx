/**
 * Confluence-style "single item" page: header (icon, title, status, meta,
 * actions), a main column of titled sections and an optional details sidebar.
 * Server-safe (no hooks) so it can be used directly from page.tsx files.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, Paperclip, type LucideIcon } from "lucide-react";

const lozengeTones = {
  success: "bg-[#E3FCEF] text-[#006644]",
  inprogress: "bg-[#DEEBFF] text-[#0052CC]",
  moved: "bg-[#FFF4E5] text-[#974F0C]",
  removed: "bg-[#FFEBE6] text-[#BF2600]",
  new: "bg-[#EAE6FF] text-[#403294]",
  default: "bg-[#091E420F] text-[#42526E]",
} as const;
export type LozengeTone = keyof typeof lozengeTones;

const statusTone: Record<string, LozengeTone> = {
  active: "success",
  published: "success",
  approved: "success",
  resolved: "success",
  completed: "success",
  paid: "success",
  open: "inprogress",
  in_progress: "inprogress",
  ongoing: "inprogress",
  scheduled: "inprogress",
  draft: "moved",
  pending: "moved",
  medium: "moved",
  upcoming: "new",
  new: "new",
  low: "default",
  high: "removed",
  urgent: "removed",
  critical: "removed",
  rejected: "removed",
  declined: "removed",
  cancelled: "removed",
  failed: "removed",
};

/** ADS lozenge; tone inferred from common status words when not given. */
export function Lozenge({ value, tone }: { value: ReactNode; tone?: LozengeTone }) {
  const key = String(value ?? "").toLowerCase().trim().replace(/\s+/g, "_");
  const resolved = tone ?? statusTone[key] ?? "default";
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-[3px] px-1 text-[11px] font-bold uppercase leading-4 ${lozengeTones[resolved]}`}
    >
      <span className="truncate">{String(value ?? "").replaceAll("_", " ")}</span>
    </span>
  );
}

export function DetailPage({
  title,
  icon: Icon,
  status,
  meta,
  actions,
  back,
  aside,
  children,
}: {
  title: ReactNode;
  icon?: LucideIcon;
  status?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {back && (
        <Link
          href={back.href}
          className="inline-flex items-center gap-1.5 rounded-[3px] text-sm font-medium text-[#42526E] hover:text-[#0052CC] hover:underline"
        >
          <ArrowLeft className="size-4" />
          {back.label}
        </Link>
      )}
      <header className="mt-3 flex flex-wrap items-start justify-between gap-4 border-b border-[#DFE1E6] pb-5">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-[3px] bg-[#DEEBFF] text-[#0052CC]">
              <Icon className="size-5" />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-semibold leading-7 text-[#172B4D]">
              {title}
            </h1>
            {(status || meta) && (
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#6B778C]">
                {typeof status === "string" ? <Lozenge value={status} /> : status}
                {meta}
              </div>
            )}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>
      <div
        className={`mt-6 grid items-start gap-6 ${aside ? "lg:grid-cols-[minmax(0,1fr)_320px]" : ""}`}
      >
        <div className="min-w-0 space-y-6">{children}</div>
        {aside && <aside className="min-w-0 space-y-6 lg:sticky lg:top-6">{aside}</aside>}
      </div>
    </div>
  );
}

export function DetailSection({
  title,
  description,
  action,
  children,
  flush = false,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  flush?: boolean;
}) {
  return (
    <section className="card !p-0 overflow-hidden">
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-[#DFE1E6] px-5 py-3.5">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-[#172B4D]">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-[#6B778C]">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={flush ? "" : "px-5 py-4"}>{children}</div>
    </section>
  );
}

export type DetailItem = {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
};

/** Key/value rows (label column + value), Confluence page-properties style. */
export function DetailList({
  items,
  compact = false,
}: {
  items: DetailItem[];
  compact?: boolean;
}) {
  return (
    <dl className="-my-1">
      {items.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className={`ds-detail-row grid gap-1 py-3 ${compact ? "" : "sm:grid-cols-[180px_minmax(0,1fr)] sm:gap-4"}`}
        >
          <dt className="flex items-center gap-2 text-sm text-[#6B778C]">
            {Icon && <Icon className="size-4 shrink-0" />}
            {label}
          </dt>
          <dd className="min-w-0 break-words text-sm text-[#172B4D]">
            {value === null || value === undefined || value === "" ? (
              <span className="text-[#6B778C]">—</span>
            ) : (
              value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Rich text body (announcement, ticket description, …). */
export function DetailBody({ html }: { html: string | null | undefined }) {
  if (!html) return <p className="text-sm text-[#6B778C]">No content.</p>;
  return (
    <div
      className="legal-prose max-w-none text-sm leading-6 text-[#172B4D]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function AttachmentLink({
  href,
  label = "Attachment",
  download = false,
}: {
  href: string;
  label?: string;
  download?: boolean;
}) {
  const name = decodeURIComponent(href.split("?")[0].split("/").pop() || label);
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      {...(download ? { download: "" } : {})}
      className="flex items-center gap-3 rounded-[3px] border border-[#DFE1E6] p-3 transition-colors hover:bg-[#091E420F]"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-[3px] bg-[#DEEBFF] text-[#0052CC]">
        <Paperclip className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-[#172B4D]">{name}</span>
        <span className="block text-xs text-[#6B778C]">{label}</span>
      </span>
    </a>
  );
}

export const formatDate = (value: string | null | undefined, withTime = false) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      })
    : "—";
