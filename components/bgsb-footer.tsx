import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Music2, Phone } from "lucide-react";
const official = "https://bgsb.lk";
export function BgsbFooter() {
  return (
    <footer className="bg-[#071d36] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="inline-block rounded-xl bg-white p-3">
            <img
              src="https://bgsb.lk/bgs-logo.png"
              alt="BGSB"
              className="h-14 w-auto max-w-[190px] object-contain"
            />
          </Link>
          <p className="mt-5 text-sm leading-7 text-white/55">
            Empowering students globally with quality education and programmes
            designed to build skills, confidence and career success.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              aria-label="Facebook"
              href="https://www.facebook.com/people/British-Graduates-School-of-Business/61572994924072/"
              className="grid size-9 place-items-center rounded-lg bg-white/10"
            >
              <Facebook className="size-4" />
            </a>
            <a
              aria-label="Instagram"
              href="https://www.instagram.com/bgsblk?igsh=b3c0YWhoYndoeTB0"
              className="grid size-9 place-items-center rounded-lg bg-white/10"
            >
              <Instagram className="size-4" />
            </a>
            <a
              aria-label="TikTok"
              href="https://www.tiktok.com/@bgs.__.lk?_r=1&_t=ZS-984uCuewsy2"
              target="_blank"
              rel="noreferrer"
              className="grid size-9 place-items-center rounded-lg bg-white/10 transition hover:bg-white/20"
            >
              <Music2 className="size-4" />
            </a>
          </div>
        </div>
        <FooterGroup
          title="Quick Links"
          links={[
            ["Home", official],
            ["About BGSB", `${official}/about`],
            ["Admissions", `${official}/admissions`],
            ["Programs", `${official}/programs`],
            ["Contact", `${official}/contact`],
          ]}
        />
        <FooterGroup
          title="Student Services"
          links={[
            ["Student Life", `https://bgsb.lk/student-life`],
            ["Resources", `https://bgsb.lk/careers`],
            ["Events & News", `https://bgsb.lk/blog`],
            ["Apply Now", "https://bgsb.lk/admissions"],
          ]}
        />
        <div>
          <h3 className="font-bold">Contact Information</h3>
          <div className="mt-5 space-y-4 text-sm leading-6 text-white/55">
            <p className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3">
              <MapPin className="mt-1 size-4 text-red-300" />
              <span>No 19, Haig Road, Colombo 04, Bambalapitiya, Sri Lanka 00400</span>
            </p>
            <a href="tel:+94117221192" className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3">
              <Phone className="mt-1 size-4 text-red-300" />
              <span>+94 117 221 192</span>
            </a>
            <a href="mailto:info@bgsb.lk" className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3">
              <Mail className="mt-1 size-4 text-red-300" />
              <span>info@bgsb.lk</span>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-6 py-5 text-xs text-white/75">
          <span>
            © {new Date().getFullYear()} British Graduates School of Business.
            All Rights Reserved.
          </span>
          <a
            href="/terms-and-conditions"
            className="font-semibold text-white transition hover:text-red-200"
          >
            Terms & Conditions
          </a>
        </div>
      </div>
    </footer>
  );
}
function FooterGroup({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <h3 className="font-bold">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm text-white/55">
        {links.map(([label, url]) => (
          <li key={label}>
            <a className="transition hover:text-white" href={url}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
