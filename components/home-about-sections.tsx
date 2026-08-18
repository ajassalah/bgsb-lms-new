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
      <section className="relative overflow-hidden bg-navy px-6 py-24 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(198,40,40,.25),transparent_35%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="font-bold uppercase tracking-[.22em] text-red-300">
            About BGSB
          </p>
          <h2 className="mt-5 max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
            Higher education, without the gatekeeping.
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">
            British Graduates School of Business was established on 25 November
            2022 with a simple conviction: quality education should be
            accessible to everyone, everywhere.
          </p>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-16 md:grid-cols-2">
        <InfoCard icon={Target} title="Our Mission">
          To make internationally accredited higher education accessible,
          affordable and applicable—meeting learners where they are and
          equipping them for the work ahead.
        </InfoCard>
        <InfoCard icon={Lightbulb} title="Our Vision">
          A Sri Lanka where a student&apos;s postcode, income or age never
          limits the credential they can earn or the career they can build.
        </InfoCard>
      </section>
      <section className="bg-white px-6 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="font-bold uppercase tracking-widest text-red">
              Our story
            </p>
            <h2 className="mt-3 text-4xl font-bold text-navy">
              A young institution with an old belief.
            </h2>
            <p className="mt-6 leading-8 text-slate-600">
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
      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="font-bold uppercase tracking-widest text-red">
          Academic breadth
        </p>
        <h2 className="mt-3 text-4xl font-bold text-navy">
          21 specialisations, one campus.
        </h2>
        <div className="mt-9 flex flex-wrap gap-3">
          {fields.map((field) => (
            <span
              className="rounded-full border bg-white px-4 py-2 text-sm font-semibold text-navy"
              key={field}
            >
              {field}
            </span>
          ))}
        </div>
      </section>
      <section className="bg-navy px-6 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
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
    <div className="card">
      <Icon className="text-red" />
      <h2 className="mt-5 text-2xl font-bold text-navy">{title}</h2>
      <p className="mt-3 leading-7 text-slate-500">{children}</p>
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
    <div className="card">
      <Icon className="text-red" />
      <b className="mt-5 block text-3xl text-navy">{value}</b>
      <span className="text-sm text-slate-500">{label}</span>
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
    <div>
      <Icon className="text-red-300" />
      <h3 className="mt-5 text-xl font-bold">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/55">{children}</p>
    </div>
  );
}
