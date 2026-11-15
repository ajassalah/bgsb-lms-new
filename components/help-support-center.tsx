"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
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

  const statusLabel =
    status === "checking"
      ? "Checking"
      : status === "operational"
        ? "All systems operational"
        : "Check required";
  const statusTone =
    status === "operational"
      ? "bg-[#E3FCEF] text-[#006644]"
      : status === "issue"
        ? "bg-[#FFF4E5] text-[#974F0C]"
        : "bg-[#091E420F] text-[#42526E]";
  const dotTone =
    status === "operational"
      ? "bg-[#36B37E]"
      : status === "issue"
        ? "bg-[#FF8B00]"
        : "bg-[#C1C7D0]";
  const quickLinks = [
    { icon: Headphones, title: "Raise a request", text: "Report a technical issue or ask the support team for help.", label: "Create a ticket", href: ticketNewUrl, tone: "bg-[#DEEBFF] text-[#0052CC]" },
    { icon: BookOpen, title: "User guides", text: "Step-by-step guides for using the BGSB LMS.", label: "Browse guides", href: "#guides", tone: "bg-[#EAE6FF] text-[#403294]" },
    { icon: CircleHelp, title: "FAQs", text: "Quick answers to the most common questions.", label: "View FAQs", href: faqUrl, tone: "bg-[#E3FCEF] text-[#006644]" },
    { icon: MessageCircle, title: "Contact support", text: "Reach the support team by email or phone.", label: "Contact us", href: "#contact-support", tone: "bg-[#FFF4E5] text-[#974F0C]" },
  ];
  const contactRows = [
    { label: "Email", value: contact.email, icon: MessageCircle },
    { label: "Phone", value: contact.phone, icon: Headphones },
    { label: "Hours", value: contact.hours, icon: Clock3 },
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-8 pb-10">
      <section className="ds-help-hero rounded-[3px] border border-[#DFE1E6] px-5 py-10 text-center sm:px-10 sm:py-12">
        <span className="mx-auto grid size-12 place-items-center rounded-[3px] bg-[#0052CC] text-white">
          <LifeBuoy className="size-6" />
        </span>
        <h1 className="mt-4 text-[28px] font-semibold leading-8 text-[#172B4D]">
          How can we help?
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[#42526E]">
          Search the help articles and FAQs, or contact the BGSB LMS support team.
        </p>
        <label className="mx-auto mt-6 flex h-12 max-w-2xl items-center gap-3 rounded-[3px] border border-[#8590A2] bg-white px-4">
          <Search aria-hidden className="size-5 shrink-0 text-[#6B778C]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search help"
            className="ds-bare h-full min-w-0 flex-1 bg-transparent text-base text-[#172B4D] outline-none placeholder:text-[#6B778C]"
            placeholder="Search for help, guides or common questions"
          />
        </label>
      </section>

      <section aria-label="Get help" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="card group flex flex-col !p-5 transition-shadow hover:shadow-[0_4px_8px_-2px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]"
          >
            <span className={`grid size-10 place-items-center rounded-[3px] ${item.tone}`}>
              <item.icon className="size-5" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-[#172B4D]">{item.title}</h2>
            <p className="mt-1 flex-1 text-sm leading-5 text-[#42526E]">{item.text}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#0052CC] group-hover:underline">
              {item.label}
              <ChevronRight className="size-4" />
            </span>
          </Link>
        ))}
      </section>

      <section id="guides" className="scroll-mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-[#172B4D]">Browse by topic</h2>
            <p className="mt-1 text-sm text-[#6B778C]">
              {visibleCategories.length} {visibleCategories.length === 1 ? "topic" : "topics"}
              {search ? ` matching "${query.trim()}"` : ""}
            </p>
          </div>
          <Link href={ticketsUrl} className="btn-secondary">
            <TicketCheck className="size-4" /> My support tickets
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleCategories.map((category) => (
            <article key={category.name} className="card !p-0">
              <header className="flex items-center gap-3 border-b border-[#DFE1E6] px-5 py-3.5">
                <span className="grid size-8 place-items-center rounded-[3px] bg-[#DEEBFF] text-[#0052CC]">
                  <category.icon className="size-4" />
                </span>
                <h3 className="text-sm font-semibold text-[#172B4D]">{category.name}</h3>
              </header>
              <ul className="px-2 py-2">
                {category.topics.map((topic) => (
                  <li
                    key={topic}
                    className="flex items-center gap-2.5 rounded-[3px] px-3 py-1.5 text-sm text-[#42526E]"
                  >
                    <FileText aria-hidden className="size-4 shrink-0 text-[#6B778C]" />
                    {topic}
                  </li>
                ))}
              </ul>
            </article>
          ))}
          {!visibleCategories.length && (
            <p className="col-span-full rounded-[3px] border border-dashed border-[#C1C7D0] p-10 text-center text-sm text-[#6B778C]">
              No topics match your search.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-[#172B4D]">Frequently asked questions</h2>
        <div className="card mt-4 !p-0">
          {visibleFaqs.map((faq, index) => {
            const open = openFaq === faq.id;
            return (
              <article key={faq.id} className={index ? "border-t border-[#DFE1E6]" : ""}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? null : faq.id)}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left text-sm font-medium text-[#172B4D] transition-colors hover:bg-[#091E420F]"
                >
                  <ChevronRight
                    aria-hidden
                    className={`size-4 shrink-0 text-[#6B778C] transition-transform ${open ? "rotate-90" : ""}`}
                  />
                  {faq.question}
                </button>
                {open && (
                  <div
                    className="legal-prose px-5 pb-4 pl-12 text-sm leading-6 text-[#42526E]"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                )}
              </article>
            );
          })}
          {!visibleFaqs.length && (
            <p className="p-10 text-center text-sm text-[#6B778C]">No FAQs match your search.</p>
          )}
        </div>
      </section>

      <section
        id="contact-support"
        className="grid scroll-mt-6 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
      >
        <article className="card !p-0">
          <header className="border-b border-[#DFE1E6] px-5 py-3.5">
            <h2 className="text-base font-semibold text-[#172B4D]">Contact the support team</h2>
            <p className="mt-0.5 text-xs text-[#6B778C]">
              Need more help? We&apos;re available for LMS questions and technical issues.
            </p>
          </header>
          <dl className="px-5 py-2">
            {contactRows.map((row) => (
              <div
                key={row.label}
                className="ds-detail-row grid gap-1 py-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4"
              >
                <dt className="flex items-center gap-2 text-sm text-[#6B778C]">
                  <row.icon className="size-4" />
                  {row.label}
                </dt>
                <dd className="break-all text-sm font-medium text-[#172B4D]">{row.value}</dd>
              </div>
            ))}
          </dl>
        </article>
        <article className="card !p-0">
          <header className="flex items-center justify-between gap-3 border-b border-[#DFE1E6] px-5 py-3.5">
            <h2 className="text-base font-semibold text-[#172B4D]">System status</h2>
            <span className={`rounded-[3px] px-1 text-[11px] font-bold uppercase leading-4 ${statusTone}`}>
              {statusLabel}
            </span>
          </header>
          <ul className="px-5 py-2">
            {["LMS platform", "Login services", "Course access", "Assignment submission", "Live classes"].map(
              (service) => (
                <li
                  key={service}
                  className="ds-detail-row flex items-center justify-between py-2.5 text-sm text-[#172B4D]"
                >
                  {service}
                  <span className="inline-flex items-center gap-2 text-xs text-[#6B778C]">
                    <span className={`size-2 rounded-full ${dotTone}`} />
                    {status === "operational" ? "Operational" : status === "issue" ? "Check" : "Checking"}
                  </span>
                </li>
              ),
            )}
          </ul>
          <p className="flex items-center gap-2 border-t border-[#DFE1E6] px-5 py-3 text-xs text-[#6B778C]">
            <Clock3 className="size-3.5" /> Last checked just now
          </p>
        </article>
      </section>
    </div>
  );
}
