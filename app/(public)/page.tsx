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
    <main>
      <section className="relative min-h-[820px] overflow-hidden bg-navy px-6 py-24 text-white lg:min-h-[900px]">
        <img
          src="/hero%20image.jpeg"
          alt="Historic university library illuminated by warm sunlight"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06182c]/95 via-[#06182c]/75 to-[#06182c]/25" />
        <div className="relative mx-auto flex min-h-[650px] max-w-7xl items-center lg:min-h-[730px]">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-bold uppercase tracking-[.25em] text-red-300">
              Learn. Lead. Transform.
            </p>
            <h1 className="text-5xl font-bold leading-tight drop-shadow md:text-7xl">
              Business education built for tomorrow.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              Your dedicated learning space for BGSB programmes, expert
              instruction and measurable progress.
            </p>
            <Link
              className="btn-primary mt-9 inline-flex px-7 py-4 text-base shadow-xl"
              href="/login"
            >
              Login to BGSB LMS <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-5 md:grid-cols-4">
          {features.map(([label, Icon]) => (
            <div className="card" key={label}>
              <Icon className="mb-5 text-red" />
              <h3 className="font-bold text-navy">{label}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Purposeful tools that keep your development moving forward.
              </p>
            </div>
          ))}
        </div>
      </section>
      <HomeAboutSections />
    </main>
  );
}
