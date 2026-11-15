import Link from "next/link";
import { ArrowRight, BookOpen, Radio, ShieldCheck, Users } from "lucide-react";
import { HomeAboutSections } from "@/components/home-about-sections";
import { HeroIllustration } from "@/components/hero-illustration";

const features = [
  ["Expert-led learning", Users, "bg-[#DEEBFF] text-[#0052CC]"],
  ["Structured courses", BookOpen, "bg-[#EAE6FF] text-[#403294]"],
  ["Live classrooms", Radio, "bg-[#E6FCFF] text-[#00849B]"],
  ["Secure access", ShieldCheck, "bg-[#E3FCEF] text-[#006644]"],
] as const;

export default function Home() {
  return (
    <main className="ds-public landing bg-white text-[#172B4D]">
      <section className="ds-hero relative overflow-hidden bg-gradient-to-b from-[#DEEBFF] via-[#F4F8FF] to-white px-4 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-24">
        <svg
          aria-hidden
          viewBox="0 0 400 400"
          className="pointer-events-none absolute -right-24 -top-24 hidden w-[420px] opacity-70 lg:block"
        >
          <circle cx="250" cy="150" r="150" fill="#B3D4FF" opacity="0.5" />
          <rect x="60" y="180" width="110" height="110" rx="12" fill="#4C9AFF" opacity="0.25" transform="rotate(16 115 235)" />
        </svg>
        <div className="relative mx-auto max-w-[1200px]">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="landing-rise">
              <p className="inline-flex items-center gap-2 rounded-[3px] bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#0052CC] shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]">
                Learn. Lead. Transform.
              </p>
              <h1 className="mt-6 text-[40px] font-bold leading-[1.1] tracking-[-0.02em] text-[#172B4D] sm:text-5xl xl:text-[60px]">
                Business education built for{" "}
                <span className="text-[#0052CC]">tomorrow.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#42526E] md:text-xl">
                Your dedicated learning space for BGSB programmes, expert
                instruction and measurable progress.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  className="group inline-flex h-12 items-center rounded-[3px] bg-[#0052CC] px-6 text-base font-medium text-white transition-colors hover:bg-[#0065FF] active:bg-[#0747A6]"
                  href="/login"
                >
                  Log in to BGSB LMS
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  className="inline-flex h-12 items-center rounded-[3px] bg-[#091E420F] px-6 text-base font-medium text-[#42526E] transition-colors hover:bg-[#091E4224] hover:text-[#172B4D]"
                  href="#about"
                >
                  About BGSB
                </a>
              </div>
            </div>
            <div className="landing-rise relative [animation-delay:150ms]">
              <HeroIllustration />
            </div>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {features.map(([label, Icon, tone]) => (
              <div
                className="ds-card rounded-[3px] bg-white p-6 shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)] transition-shadow hover:shadow-[0_8px_12px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.31)]"
                key={label}
              >
                <span className={`grid size-10 place-items-center rounded-[3px] ${tone}`}>
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-[#172B4D]">{label}</h3>
                <p className="mt-1.5 text-sm leading-6 text-[#6B778C]">
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
