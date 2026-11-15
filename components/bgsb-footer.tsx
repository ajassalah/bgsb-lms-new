import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Music2, Phone } from "lucide-react";
const official = "https://bgsb.lk";
export function BgsbFooter() {
  return (
    <footer className="ds-public ds-footer border-t border-[#DFE1E6] bg-[#F4F5F7] px-4 text-[#172B4D] sm:px-6">
      <div className="mx-auto grid max-w-[1200px] gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="inline-block">
            <img
              src="/bgsb-logo-trimmed.png"
              alt="BGSB"
              className="h-11 w-auto max-w-[190px] object-contain"
            />
          </Link>
          <p className="mt-5 text-sm leading-6 text-[#6B778C]">
            Empowering students globally with quality education and programmes
            designed to build skills, confidence and career success.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              aria-label="Facebook"
              href="https://www.facebook.com/people/British-Graduates-School-of-Business/61572994924072/"
              className="grid size-9 place-items-center rounded-full bg-white text-[#42526E] shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)] transition-colors hover:text-[#0052CC]"
            >
              <Facebook className="size-4" />
            </a>
            <a
              aria-label="Instagram"
              href="https://www.instagram.com/bgsblk?igsh=b3c0YWhoYndoeTB0"
              className="grid size-9 place-items-center rounded-full bg-white text-[#42526E] shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)] transition-colors hover:text-[#0052CC]"
            >
              <Instagram className="size-4" />
            </a>
            <a
              aria-label="TikTok"
              href="https://www.tiktok.com/@bgs.__.lk?_r=1&_t=ZS-984uCuewsy2"
              target="_blank"
              rel="noreferrer"
              className="grid size-9 place-items-center rounded-full bg-white text-[#42526E] shadow-[0_1px_1px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)] transition-colors hover:text-[#0052CC]"
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
          <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#6B778C]">Contact Information</h3>
          <div className="mt-5 space-y-4 text-sm leading-6 text-[#42526E]">
            <p className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3">
              <MapPin className="mt-1 size-4 text-[#0052CC]" />
              <span>No 19, Haig Road, Colombo 04, Bambalapitiya, Sri Lanka 00400</span>
            </p>
            <a href="tel:+94117221192" className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3 hover:text-[#0052CC]">
              <Phone className="mt-1 size-4 text-[#0052CC]" />
              <span>+94 117 221 192</span>
            </a>
            <a href="mailto:info@bgsb.lk" className="grid grid-cols-[1rem_minmax(0,1fr)] items-start gap-3 hover:text-[#0052CC]">
              <Mail className="mt-1 size-4 text-[#0052CC]" />
              <span>info@bgsb.lk</span>
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] border-t border-[#DFE1E6]">
        <div className="flex flex-wrap justify-between gap-3 py-5 text-xs text-[#6B778C]">
          <span>
            © {new Date().getFullYear()} British Graduates School of Business.
            All Rights Reserved.
          </span>
          <a
            href="/terms-and-conditions"
            className="font-medium text-[#0052CC] hover:underline"
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
      <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#6B778C]">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm text-[#42526E]">
        {links.map(([label, url]) => (
          <li key={label}>
            <a className="transition-colors hover:text-[#0052CC] hover:underline" href={url}>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
