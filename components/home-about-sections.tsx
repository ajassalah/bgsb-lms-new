import {
  Award,
  BookOpen,
  Globe2,
  HeartHandshake,
  Lightbulb,
  Target,
  Users,
} from "lucide-react";

const fields = [
  "Health & Social Care",
  "Health & Safety Management",
  "Hospitality & Tourism",
  "Human Resource Management",
  "Accounting & Finance",
  "Law & Legal Services",
  "Business & Management",
  "Information Technology",
  "Data Science & AI",
  "Marketing",
  "Cyber Security",
  "Logistics & Supply Chain",
  "Education, Teaching & Coaching",
  "Psychology",
  "Sports Coaching",
  "TEFL",
  "Quality Assurance & Assessment",
  "Aesthetic Practice",
  "Beauty Therapy",
  "Hairdressing",
  "Wellness",
];

export function HomeAboutSections() {
  return (
    <>
      <section id="about" className="ds-band scroll-mt-20 bg-[#F4F5F7] px-4 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid items-end gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>About BGSB</Eyebrow>
              <h2 className="mt-4 text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-[#172B4D] md:text-[44px]">
                Higher education, without the{" "}
                <span className="text-[#0052CC]">gatekeeping.</span>
              </h2>
            </div>
            <p className="text-lg leading-8 text-[#42526E]">
              British Graduates School of Business was established on 25
              November 2022 with a simple conviction: quality education should
              be accessible to everyone, everywhere.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <InfoCard icon={Target} title="Our Mission" tone="bg-[#0052CC] text-white">
              To make internationally accredited higher education accessible,
              affordable and applicable—meeting learners where they are and
              equipping them for the work ahead.
            </InfoCard>
            <InfoCard icon={Lightbulb} title="Our Vision" tone="bg-[#6554C0] text-white">
              A Sri Lanka where a student&apos;s postcode, income or age never
              limits the credential they can earn or the career they can
              build.
            </InfoCard>
          </div>
        </div>
      </section>
      <section className="bg-white px-4 py-20 sm:px-6 md:py-28">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Eyebrow>Our story</Eyebrow>
            <h2 className="mt-4 text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-[#172B4D] md:text-[40px]">
              A young institution with an old belief.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#42526E]">
              BGSB opened its doors in late 2022, born from a partnership
              between educators and industry leaders who wanted to close the gap
              between what employers need and what qualifications deliver.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Fact icon={BookOpen} value="L3–L8" label="Diploma pathways" />
            <Fact icon={Globe2} value="21" label="Specialisations" />
            <Fact icon={Users} value="1000s" label="Learners supported" />
            <Fact icon={Award} value="Global" label="Progression routes" />
          </div>
        </div>
      </section>
      <section className="ds-band bg-[#F4F5F7] px-4 py-20 sm:px-6 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <Eyebrow>Academic breadth</Eyebrow>
          <h2 className="mt-4 text-[32px] font-bold leading-[1.15] tracking-[-0.02em] text-[#172B4D] md:text-[40px]">
            21 specialisations, one campus.
          </h2>
          <div className="mt-10 flex flex-wrap gap-2">
            {fields.map((field) => (
              <span
                className="ds-chip cursor-default rounded-[3px] border-2 border-[#DFE1E6] bg-white px-3 py-1.5 text-sm font-medium text-[#42526E] transition-colors hover:border-[#4C9AFF] hover:text-[#0052CC]"
                key={field}
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white px-4 py-20 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-[1200px] gap-4 md:grid-cols-3">
          <Value icon={Users} title="Experienced faculty" tone="bg-[#DEEBFF] text-[#0052CC]">
            Qualified faculty, active industry practice and learner-centred
            teaching.
          </Value>
          <Value icon={HeartHandshake} title="Student-first support" tone="bg-[#E3FCEF] text-[#006644]">
            Responsive admissions, progression guidance and long-term learner
            support.
          </Value>
          <Value icon={Award} title="Accreditation & quality" tone="bg-[#FFF4E5] text-[#974F0C]">
            Qualifications designed for international value and progression.
          </Value>
        </div>
      </section>
      <section className="ds-cta bg-[#0747A6] px-4 py-16 text-white sm:px-6">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-[28px] font-bold leading-tight tracking-[-0.01em] text-white md:text-[32px]">
              Ready to continue learning?
            </h2>
            <p className="mt-2 text-base text-[#DEEBFF]">
              Log in to reach your courses, live classes and progress.
            </p>
          </div>
          <a
            href="/login"
            className="inline-flex h-12 shrink-0 items-center rounded-[3px] bg-white px-6 text-base font-medium text-[#0052CC] transition-colors hover:bg-[#DEEBFF]"
          >
            Log in to BGSB LMS
          </a>
        </div>
      </section>
    </>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#0052CC]">
      {children}
    </p>
  );
}
const cardShadow =
  "shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)] transition-shadow hover:shadow-[0_8px_12px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.31)]";
function InfoCard({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: typeof Target;
  title: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`ds-card rounded-[3px] bg-white p-8 ${cardShadow}`}>
      <span className={`grid size-12 place-items-center rounded-[3px] ${tone}`}>
        <Icon className="size-6" />
      </span>
      <h3 className="mt-5 text-2xl font-semibold text-[#172B4D]">{title}</h3>
      <p className="mt-3 text-base leading-7 text-[#42526E]">{children}</p>
    </div>
  );
}
function Fact({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof BookOpen;
  value: string;
  label: string;
}) {
  return (
    <div className={`ds-card rounded-[3px] bg-white p-6 ${cardShadow}`}>
      <Icon className="size-5 text-[#0052CC]" />
      <b className="mt-6 block text-[32px] font-bold leading-none tracking-[-0.02em] text-[#172B4D]">
        {value}
      </b>
      <span className="mt-2 block text-sm text-[#6B778C]">{label}</span>
    </div>
  );
}
function Value({
  icon: Icon,
  title,
  tone,
  children,
}: {
  icon: typeof Users;
  title: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`ds-card rounded-[3px] bg-white p-6 ${cardShadow}`}>
      <span className={`grid size-10 place-items-center rounded-[3px] ${tone}`}>
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-[#172B4D]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#6B778C]">{children}</p>
    </div>
  );
}
