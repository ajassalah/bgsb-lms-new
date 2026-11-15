"use client";
/** Dashboard building blocks in the Atlassian Design System style. */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";

export type Tone = "blue" | "green" | "purple" | "orange" | "teal" | "red";
const tones: Record<Tone, string> = {
  blue: "bg-[#DEEBFF] text-[#0747A6]",
  green: "bg-[#E3FCEF] text-[#006644]",
  purple: "bg-[#EAE6FF] text-[#403294]",
  orange: "bg-[#FFF4E5] text-[#974F0C]",
  teal: "bg-[#E6FCFF] text-[#00849B]",
  red: "bg-[#FFEBE6] text-[#BF2600]",
};
export const toneHex: Record<Tone, string> = {
  blue: "#0065FF",
  green: "#36B37E",
  purple: "#6554C0",
  orange: "#FF8B00",
  teal: "#00B8D9",
  red: "#FF5630",
};

const COLOMBO = "Asia/Colombo";
export const colomboDateKey = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: COLOMBO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}

export function greetingFor(now: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: COLOMBO,
      hour: "2-digit",
      hour12: false,
    }).format(now),
  );
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-[#172B4D]">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-[#42526E]">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className = "",
  bodyClassName = "p-4 sm:p-5",
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`card !p-0 min-w-0 overflow-hidden ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-[#172B4D]">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-xs text-[#6B778C]">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function PanelLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[#0052CC] hover:underline"
    >
      {children}
    </Link>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "blue",
  meta,
  href,
  children,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  meta?: ReactNode;
  href?: string;
  children?: ReactNode;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#42526E]">{label}</p>
          <p className="mt-1 text-[28px] font-semibold leading-8 tracking-tight text-[#172B4D]">
            {value}
          </p>
        </div>
        <span className={`grid size-10 shrink-0 place-items-center rounded-[6px] ${tones[tone]}`}>
          <Icon aria-hidden className="size-5" />
        </span>
      </div>
      {meta && <p className="mt-2 text-xs text-[#6B778C]">{meta}</p>}
      {children}
    </>
  );
  const cls = "card !p-4 block min-w-0 transition-shadow";
  return href ? (
    <Link href={href} className={`${cls} hover:shadow-overlay`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Lozenge({
  tone = "blue",
  children,
}: {
  tone?: Tone | "neutral";
  children: ReactNode;
}) {
  const cls =
    tone === "neutral" ? "bg-[#091E420F] text-[#42526E]" : tones[tone];
  return <span className={`ds-lozenge ${cls}`}>{children}</span>;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center">
      <span className="grid size-11 place-items-center rounded-full bg-[#EBECF0] text-[#6B778C]">
        <Icon aria-hidden className="size-5" />
      </span>
      <p className="mt-3 text-sm font-semibold text-[#172B4D]">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-xs leading-5 text-[#6B778C]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value, tone = "blue" }: { value: number; tone?: Tone }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 w-full overflow-hidden rounded-full bg-[#091E420F]"
    >
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: toneHex[tone] }} />
    </div>
  );
}

/** First-login dialog, used by staff, instructor and student dashboards. */
export function WelcomeDialog({
  open,
  icon: Icon,
  title,
  children,
  cta,
  onClose,
}: {
  open: boolean;
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  cta: string;
  onClose: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    buttonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[250] grid place-items-center bg-[#091E427D] p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="relative w-full max-w-lg rounded-[8px] bg-white shadow-overlay"
      >
        <div className="flex items-start gap-3 px-6 pb-2 pt-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-[6px] bg-[#DEEBFF] text-[#0747A6]">
            <Icon aria-hidden className="size-5" />
          </span>
          <h2 id="welcome-title" className="pr-8 pt-2 text-xl font-semibold text-[#172B4D]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid size-8 place-items-center rounded-[3px] text-[#42526E] hover:bg-[#091E420F]"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-3 px-6 py-2 text-sm leading-6 text-[#42526E]">{children}</div>
        <div className="flex justify-end px-6 pb-6 pt-4">
          <button ref={buttonRef} type="button" onClick={onClose} className="btn btn-primary">
            {cta}
          </button>
        </div>
      </section>
    </div>
  );
}

export type AgendaItem = {
  id: string;
  title: string;
  start: string;
  kind?: string;
  meetingUrl?: string | null;
};

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    timeZone: COLOMBO,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function AgendaList({
  items,
  emptyText = "Nothing scheduled",
  limit = 5,
}: {
  items: AgendaItem[];
  emptyText?: string;
  limit?: number;
}) {
  if (!items.length)
    return (
      <EmptyState
        icon={CalendarClock}
        title={emptyText}
        description="Upcoming live classes and appointments will show up here."
      />
    );
  return (
    <ul className="divide-y divide-[#091E4224]">
      {items.slice(0, limit).map((item) => {
        const date = new Date(item.start);
        return (
          <li key={item.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-1">
            <span className="flex w-11 shrink-0 flex-col items-center rounded-[4px] border border-[#DFE1E6] py-1 leading-none">
              <span className="text-[10px] font-semibold uppercase text-[#BF2600]">
                {date.toLocaleString("en-GB", { timeZone: COLOMBO, month: "short" })}
              </span>
              <span className="mt-0.5 text-base font-semibold text-[#172B4D]">
                {date.toLocaleString("en-GB", { timeZone: COLOMBO, day: "numeric" })}
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-[#172B4D]">
                {item.title}
              </span>
              <span className="mt-0.5 flex items-center gap-1.5 text-xs text-[#6B778C]">
                {item.kind && <Lozenge tone={item.kind === "Appointment" ? "purple" : "blue"}>{item.kind}</Lozenge>}
                {formatWhen(item.start)}
              </span>
            </span>
            {item.meetingUrl && (
              <a
                href={item.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary !min-h-8 !px-2.5 text-xs"
              >
                <Video aria-hidden className="size-3.5" />
                Join
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Month calendar with event dots; clicking a day opens the full calendar page. */
export function MiniCalendar({
  events,
  calendarHref,
}: {
  events: { start: string; title: string }[];
  calendarHref: string;
}) {
  const now = useNow(60000);
  const [month, setMonth] = useState(() => new Date());
  const days = useMemo(() => {
    const y = month.getFullYear(),
      m = month.getMonth();
    return [
      ...Array.from({ length: new Date(y, m, 1).getDay() }, () => null),
      ...Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1),
    ];
  }, [month]);
  const byDay = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const event of events) {
      const key = colomboDateKey(new Date(event.start));
      map.set(key, [...(map.get(key) || []), event.title]);
    }
    return map;
  }, [events]);
  const today = colomboDateKey(now);
  const keyFor = (day: number) =>
    `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return (
    <div>
      <div className="flex items-center justify-between">
        <b className="text-sm font-semibold text-[#172B4D]">
          {month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </b>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            className="grid size-8 place-items-center rounded-[3px] text-[#42526E] hover:bg-[#091E420F]"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            className="grid size-8 place-items-center rounded-[3px] text-[#42526E] hover:bg-[#091E420F]"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-7 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className="py-1.5 text-[11px] font-semibold text-[#6B778C]">
            {d}
          </span>
        ))}
        {days.map((day, index) => {
          if (!day) return <span key={`blank-${index}`} />;
          const key = keyFor(day);
          const titles = byDay.get(key) || [];
          const isToday = key === today;
          return (
            <Link
              key={key}
              href={`${calendarHref}?date=${key}`}
              title={titles.length ? titles.join("\n") : "Open in calendar"}
              className={`relative mx-auto grid size-9 place-items-center rounded-[3px] text-[13px] transition-colors ${isToday ? "bg-[#0052CC] font-semibold text-white hover:bg-[#0747A6]" : "text-[#172B4D] hover:bg-[#091E420F]"}`}
            >
              {day}
              {titles.length > 0 && (
                <span
                  className={`absolute bottom-1 size-1 rounded-full ${isToday ? "bg-white" : "bg-[#0052CC]"}`}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function QuickLinks({
  links,
}: {
  links: { label: string; description: string; href: string; icon: LucideIcon; tone?: Tone }[];
}) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {links.map(({ label, description, href, icon: Icon, tone = "blue" }) => (
        <li key={href}>
          <Link
            href={href}
            className="group flex items-center gap-3 rounded-[4px] border border-[#DFE1E6] p-3 transition-colors hover:border-[#0052CC] hover:bg-[#F4F5F7]"
          >
            <span className={`grid size-9 shrink-0 place-items-center rounded-[6px] ${tones[tone]}`}>
              <Icon aria-hidden className="size-[18px]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-[#172B4D]">{label}</span>
              <span className="block truncate text-xs text-[#6B778C]">{description}</span>
            </span>
            <ArrowRight
              aria-hidden
              className="size-4 shrink-0 text-[#97A0AF] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0052CC]"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Ranked list of courses with enrollment bars. */
export function CourseRanking({
  courses,
  emptyTitle,
  emptyDescription,
  unit = "enrolled",
}: {
  courses: { title: string; enrollments: number }[];
  emptyTitle: string;
  emptyDescription?: string;
  unit?: string;
}) {
  const max = Math.max(1, ...courses.map((c) => c.enrollments));
  if (!courses.length)
    return <EmptyState icon={CalendarClock} title={emptyTitle} description={emptyDescription} />;
  return (
    <ol className="space-y-3">
      {courses.slice(0, 5).map((course, index) => (
        <li key={course.title + index} className="flex items-center gap-3">
          <span className="grid size-7 shrink-0 place-items-center rounded-[4px] bg-[#EBECF0] text-xs font-semibold text-[#42526E]">
            {index + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-medium text-[#172B4D]">{course.title}</span>
              <span className="shrink-0 text-xs text-[#6B778C]">
                {course.enrollments} {unit}
              </span>
            </span>
            <span className="mt-1.5 block">
              <ProgressBar value={(course.enrollments / max) * 100} />
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
