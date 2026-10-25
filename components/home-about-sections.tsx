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
      <section className="relative overflow-hidden px-6 pb-24 pt-28 md:pb-32 md:pt-36">
        <div className="landing-grid absolute inset-0" />
        <div className="absolute -right-40 top-0 size-[32rem] rounded-full bg-red/10 blur-[120px]" />
        <div className="relative mx-auto max-w-[77rem]">
          <div className="grid items-end gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>About BGSB</Eyebrow>
              <h2 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight text-navy md:text-6xl">
                Higher education, without the{" "}
                <span className="text-red">gatekeeping.</span>
              </h2>
            </div>
            <p className="border-l-2 border-red pl-6 text-lg leading-8 text-slate-600">
              British Graduates School of Business was established on 25
              November 2022 with a simple conviction: quality education should
              be accessible to everyone, everywhere.
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            <InfoCard icon={Target} title="Our Mission">
              To make internationally accredited higher education accessible,
              affordable and applicable—meeting learners where they are and
              equipping them for the work ahead.
            </InfoCard>
            <InfoCard icon={Lightbulb} title="Our Vision">
              A Sri Lanka where a student&apos;s postcode, income or age never
              limits the credential they can earn or the career they can
              build.
            </InfoCard>
          </div>
        </div>
      </section>
      <section className="landing-band border-y bg-white px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-[77rem] items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Eyebrow>Our story</Eyebrow>
            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-navy md:text-5xl">
              A young institution with an old belief.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              BGSB opened its doors in late 2022, born from a partnership
              between educators and industry leaders who wanted to close the gap
              between what employers need and what qualifications deliver.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <Fact icon={BookOpen} value="L3–L8" label="Diploma pathways" />
            <Fact icon={Globe2} value="21" label="Specialisations" />
            <Fact icon={Users} value="1000s" label="Learners supported" />
            <Fact icon={Award} value="Global" label="Progression routes" />
          </div>
        </div>
      </section>
      <section className="px-6 py-24 md:py-28">
        <div className="mx-auto max-w-[77rem]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Academic breadth</Eyebrow>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-navy md:text-5xl">
                21 specialisations, one campus.
              </h2>
            </div>
            <span className="landing-watermark font-display text-7xl font-bold leading-none tracking-tight text-slate-200 md:text-8xl">
              21
            </span>
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            {fields.map((field) => (
              <span
                className="landing-chip cursor-default rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy transition hover:-translate-y-0.5 hover:border-red/40 hover:text-red hover:shadow-soft"
                key={field}
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="landing-band border-t bg-white px-6 py-24 md:py-28">
        <div className="mx-auto grid max-w-[77rem] gap-5 md:grid-cols-3">
          <Value icon={Users} title="Experienced faculty">
            Qualified faculty, active industry practice and learner-centred
            teaching.
          </Value>
          <Value icon={HeartHandshake} title="Student-first support">
            Responsive admissions, progression guidance and long-term learner
            support.
          </Value>
          <Value icon={Award} title="Accreditation & quality">
            Qualifications designed for international value and progression.
          </Value>
        </div>
      </section>
    </>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[.25em] text-red">
      <span className="h-px w-8 bg-current" />
      {children}
    </p>
  );
}
function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Target;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card group relative overflow-hidden p-8 transition hover:-translate-y-1 md:p-10">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red to-red/0" />
      <span className="grid size-14 place-items-center rounded-2xl bg-navy text-white transition group-hover:bg-red">
        <Icon className="size-6" />
      </span>
      <h2 className="mt-7 text-2xl font-bold text-navy md:text-3xl">{title}</h2>
      <p className="mt-4 text-lg leading-8 text-slate-500">{children}</p>
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
    <div className="card group p-6 transition hover:-translate-y-1 hover:border-red/30 sm:p-8">
      <Icon className="size-6 text-red" />
      <b className="font-display mt-8 block text-3xl font-bold tracking-tight text-navy sm:text-4xl">
        {value}
      </b>
      <span className="mt-1 block text-sm font-medium text-slate-500">
        {label}
      </span>
    </div>
  );
}
function Value({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Users;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card group p-8 transition hover:-translate-y-1 hover:border-red/30">
      <span className="grid size-12 place-items-center rounded-2xl bg-red/10 text-red transition group-hover:bg-red group-hover:text-white">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-6 text-xl font-bold text-navy">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-500">{children}</p>
    </div>
  );
}
