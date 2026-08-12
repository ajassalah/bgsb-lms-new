"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
const links = [
  ["Home", "/"],
  ["About", "/about"],
  ["Courses", "/courses"],
  ["Instructors", "/instructors"],
] as const;
export function PublicNav() {
  const [open, setOpen] = useState(false),
    path = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 lg:px-6">
        <Link href="/" className="shrink-0">
          <img
            src="https://bgsb.lk/bgs-logo.png"
            alt="British Graduates School of Business"
            className="h-14 w-auto max-w-[190px] object-contain"
          />
        </Link>
        <nav className="hidden items-center gap-9 text-base font-semibold lg:flex">
          {links.map(([label, href]) => (
            <Link
              className={`border-b-2 py-2 transition ${path === href ? "border-red text-red" : "border-transparent text-navy hover:text-red"}`}
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:block">
          <Link href="/login" className="btn-primary px-7 text-base">
            Login
          </Link>
        </div>
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="grid size-11 place-items-center rounded-xl border text-navy lg:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t bg-white px-5 py-5 shadow-xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map(([label, href]) => (
              <Link
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3.5 text-base font-semibold ${path === href ? "bg-red/5 text-red" : "text-navy hover:bg-slate-50"}`}
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
            <Link
              onClick={() => setOpen(false)}
              href="/login"
              className="btn-primary mt-3 w-full text-base"
            >
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
