"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileText,
  GraduationCap,
  Headphones,
  LifeBuoy,
  LockKeyhole,
  MessageCircle,
  MonitorPlay,
  ReceiptText,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  TicketCheck,
  UserRoundCheck,
} from "lucide-react";
import { htmlToPlainText } from "@/lib/html-text";

type Faq = { id: string; question: string; answer: string };
type Category = { name: string; icon: typeof BookOpen; topics: string[] };

const categories: Category[] = [
  {
    name: "Getting Started",
    icon: GraduationCap,
    topics: [
      "Logging into the LMS",
      "Completing your profile",
      "Understanding the dashboard",
      "Navigating courses",
    ],
  },
  {
    name: "Account & Login",
    icon: LockKeyhole,
    topics: [
      "Password reset",
      "Username problems",
      "Account activation",
      "Account security",
    ],
  },
  {
    name: "Courses & Learning",
    icon: BookOpen,
    topics: [
      "Enrolling in courses",
      "Accessing course materials",
      "Watching lessons",
      "Tracking course progress",
    ],
  },
  {
    name: "Assignments",
    icon: FileText,
    topics: [
      "Viewing assignments",
      "Uploading assignments",
      "Deadlines",
      "Feedback and status",
    ],
  },
  {
    name: "Attendance",
    icon: UserRoundCheck,
    topics: [
      "Checking attendance",
      "Attendance sessions",
      "Records",
      "Corrections",
    ],
  },
  {
    name: "Live Classes",
    icon: MonitorPlay,
    topics: [
      "Joining a live class",
      "Class schedules",
      "Audio/video problems",
      "Missing classes",
    ],
  },
  {
    name: "Assessments & Exams",
    icon: ShieldCheck,
    topics: [
      "Accessing assessments",
      "Online exams",
      "Submissions",
      "Results and grades",
    ],
  },
  {
    name: "Certificates",
    icon: TicketCheck,
    topics: [
      "Eligibility",
      "Certificate status",
      "Downloading certificates",
      "Certificate issues",
    ],
  },
  {
    name: "Payments & Invoices",
    icon: ReceiptText,
    topics: [
      "Payment information",
      "Invoices",
      "Payment status",
      "Payment support",
    ],
  },
  {
    name: "Technical Issues",
    icon: Settings2,
    topics: [
      "Loading problems",
      "Browser compatibility",
      "File uploads",
      "Video and network issues",
    ],
  },
];

export function HelpSupportCenter({
  faqs,
  ticketNewUrl,
  ticketsUrl,
  faqUrl,
  contact,
}: {
  faqs: Faq[];
  ticketNewUrl: string;
  ticketsUrl: string;
  faqUrl: string;
  contact: { email: string; phone: string; hours: string };
}) {
  const [query, setQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [status, setStatus] = useState<"checking" | "operational" | "issue">(
    "checking",
  );
  useEffect(() => {
    fetch("/api/support/status", { cache: "no-store" })
      .then((response) => setStatus(response.ok ? "operational" : "issue"))
      .catch(() => setStatus("issue"));
  }, []);
  const search = query.trim().toLowerCase();
  const visibleCategories = useMemo(
    () =>
      categories.filter(
        (item) =>
          !search ||
          `${item.name} ${item.topics.join(" ")}`
            .toLowerCase()
            .includes(search),
      ),
    [search],
  );
  const visibleFaqs = useMemo(
    () =>
      faqs.filter(
        (item) =>
          !search ||
          `${item.question} ${htmlToPlainText(item.answer)}`
            .toLowerCase()
            .includes(search),
      ),
    [faqs, search],
  );

  return (
    <div className="space-y-10 pb-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#10203a] via-[#152a49] to-[#263d62] px-5 py-12 text-center text-white shadow-xl sm:px-10 sm:py-16">
        <LifeBuoy className="mx-auto size-11 text-red-300" />
        <h1 className="mt-4 text-3xl font-black sm:text-4xl">
          How can we help you?
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70 sm:text-base">
          Find answers, explore LMS guides, or contact our support team.
        </p>
        <label className="mx-auto mt-7 flex max-w-3xl items-center gap-3 rounded-2xl bg-white px-4 shadow-lg">
          <Search className="size-5 shrink-0 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-14 min-w-0 flex-1 bg-transparent text-slate-900 outline-none"
            placeholder="Search for help, guides, or common questions..."
          />
        </label>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            Headphones,
            "Submit a Support Request",
            "Report a technical issue or request assistance from our support team.",
            "Submit a Ticket",
            ticketNewUrl,
          ],
          [
            BookOpen,
            "LMS User Guide",
            "Learn how to use the BGS LMS with step-by-step guides.",
            "View Guides",
            "#guides",
          ],
          [
            CircleHelp,
            "Frequently Asked Questions",
            "Find quick answers to common LMS questions.",
            "Browse FAQs",
            faqUrl,
          ],
          [
            MessageCircle,
            "Contact Support",
            "Contact the BGS LMS support team for additional assistance.",
            "Contact Us",
            "#contact-support",
          ],
        ].map(([Icon, title, description, label, href]) => (
          <article
            key={title as string}
            className="flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-red/10 text-red">
              <Icon className="size-5" />
            </span>
            <h2 className="mt-4 font-bold text-navy dark:text-white">
              {title as string}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
              {description as string}
            </p>
            <Link
              href={href as string}
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red"
            >
              {label as string}
              <Send className="size-3.5" />
            </Link>
          </article>
        ))}
      </section>

      <section id="guides">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-red">Browse support</p>
            <h2 className="text-2xl font-bold text-navy dark:text-white">
              Help Categories
            </h2>
          </div>
          <Link href={ticketsUrl} className="btn-secondary gap-2">
            <TicketCheck className="size-4" /> My Support Tickets
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleCategories.map((category) => (
            <article
              key={category.name}
              className="rounded-2xl border bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-navy dark:bg-slate-800 dark:text-white">
                  <category.icon className="size-5" />
                </span>
                <h3 className="font-bold text-navy dark:text-white">
                  {category.name}
                </h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-500">
                {category.topics.map((topic) => (
                  <li key={topic} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    {topic}
                  </li>
                ))}
              </ul>
            </article>
          ))}
          {!visibleCategories.length && (
            <p className="col-span-full rounded-2xl border border-dashed p-10 text-center text-slate-400">
              No help categories match your search.
            </p>
          )}
        </div>
      </section>

      <section>
        <p className="text-sm font-bold text-red">Common questions</p>
        <h2 className="text-2xl font-bold text-navy dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="mt-5 space-y-3">
          {visibleFaqs.map((faq) => {
            const open = openFaq === faq.id;
            return (
              <article
                key={faq.id}
                className="overflow-hidden rounded-xl border bg-white dark:border-slate-700 dark:bg-slate-900"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : faq.id)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left font-semibold text-navy dark:text-white sm:p-5"
                >
                  {faq.question}
                  <ChevronDown
                    className={`size-5 shrink-0 transition ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <div
                    className="border-t px-4 py-5 text-sm leading-7 text-slate-600 dark:border-slate-700 dark:text-slate-300 sm:px-5"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                )}
              </article>
            );
          })}
          {!visibleFaqs.length && (
            <p className="rounded-xl border border-dashed p-10 text-center text-slate-400">
              No FAQs match your search.
            </p>
          )}
        </div>
      </section>

      <section
        id="contact-support"
        className="grid gap-5 lg:grid-cols-[1.4fr_1fr]"
      >
        <article className="rounded-2xl border bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-navy dark:text-white">
            BGS LMS Support Team
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Need additional assistance? Our support team is available to help
            with LMS-related questions and technical issues.
          </p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-bold uppercase text-slate-400">
                Support Email
              </dt>
              <dd className="mt-1 break-all font-semibold text-navy dark:text-white">
                {contact.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-slate-400">
                Support Phone
              </dt>
              <dd className="mt-1 font-semibold text-navy dark:text-white">
                {contact.phone}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-slate-400">
                Support Hours
              </dt>
              <dd className="mt-1 font-semibold text-navy dark:text-white">
                {contact.hours}
              </dd>
            </div>
          </dl>
        </article>
        <article className="rounded-2xl border bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-navy dark:text-white">
              LMS System Status
            </h2>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${status === "operational" ? "bg-emerald-100 text-emerald-700" : status === "issue" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}
            >
              {status === "checking"
                ? "Checking"
                : status === "operational"
                  ? "Operational"
                  : "Check required"}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {[
              "LMS Platform",
              "Login Services",
              "Course Access",
              "Assignment Submission",
              "Live Classes",
            ].map((service) => (
              <div
                key={service}
                className="flex items-center justify-between text-sm"
              >
                <span>{service}</span>
                <span
                  className={`size-2.5 rounded-full ${status === "operational" ? "bg-emerald-500" : status === "issue" ? "bg-amber-500" : "bg-slate-300"}`}
                />
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <Clock3 className="size-3.5" /> Last checked: just now
          </p>
        </article>
      </section>
    </div>
  );
}
