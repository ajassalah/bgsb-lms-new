import Link from "next/link";
import { ArrowRight, BookOpen, Radio, ShieldCheck, Users } from "lucide-react";
import { HomeAboutSections } from "@/components/home-about-sections";

const features = [
  ["Expert-led learning", Users],
  ["Structured courses", BookOpen],
  ["Live classrooms", Radio],
  ["Secure access", ShieldCheck],
] as const;

export default function Home() {
  return (
    <main className="landing">
      <section className="landing-hero relative overflow-hidden bg-gradient-to-b from-white to-cream px-6 pb-24 pt-20 md:pb-32 md:pt-28 lg:pt-32">
        <div className="landing-grid absolute inset-0" />
        <div className="absolute -left-40 top-20 size-[28rem] rounded-full bg-red/10 blur-[120px]" />
        <div className="relative mx-auto max-w-[77rem]">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="landing-rise">
              <p className="inline-flex items-center gap-3 rounded-full border border-red/15 bg-red/5 px-4 py-2 text-xs font-bold uppercase tracking-[.25em] text-red">
                <span className="size-1.5 rounded-full bg-red" />
                Learn. Lead. Transform.
              </p>
              <h1 className="mt-7 text-5xl font-bold leading-[1.05] tracking-tight text-navy md:text-6xl xl:text-7xl">
                Business education built for{" "}
                <span className="bg-gradient-to-r from-red to-[#e2554f] bg-clip-text text-transparent">
                  tomorrow.
                </span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">
                Your dedicated learning space for BGSB programmes, expert
                instruction and measurable progress.
              </p>
              <Link
                className="group mt-10 inline-flex items-center rounded-full bg-red px-8 py-4 text-base font-semibold text-white shadow-[0_18px_40px_-14px_rgba(198,40,40,.6)] transition hover:-translate-y-0.5 hover:bg-[#d32f2f]"
                href="/login"
              >
                Login to BGSB LMS
                <ArrowRight className="ml-3 size-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="landing-rise relative [animation-delay:150ms]">
              <div className="absolute -bottom-4 -left-4 hidden h-2/3 w-2/3 rounded-[2rem] bg-red/10 sm:block" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border-4 border-white bg-navy shadow-[0_40px_80px_-30px_rgba(10,38,71,.45)]">
                <img
                  src="/hero%20image.jpeg"
                  alt="Historic university library illuminated by warm sunlight"
                  className="landing-hero-image size-full object-cover"
                />
              </div>
            </div>
          </div>
          <div className="mt-16 grid overflow-hidden rounded-3xl border bg-white shadow-soft sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {features.map(([label, Icon], index) => (
              <div
                className="landing-feature group relative border-slate-100 p-8 transition hover:bg-slate-50 border-b last:border-b-0 sm:[&:nth-child(n+3)]:border-b-0 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
                key={label}
              >
                <span className="absolute right-7 top-7 text-xs font-bold tabular-nums text-slate-300">
                  0{index + 1}
                </span>
                <span className="grid size-12 place-items-center rounded-2xl bg-red/10 text-red transition group-hover:bg-red group-hover:text-white">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-6 text-lg font-bold text-navy">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Purposeful tools that keep your development moving forward.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <HomeAboutSections />
    </main>
  );
}
