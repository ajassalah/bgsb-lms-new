"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function PublicNav() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("admin-dark"));
  }, []);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("admin-dark", next);
    localStorage.setItem("bgsb-admin-theme", next ? "dark" : "light");
  }
  return (
    <header className="public-nav sticky top-0 z-50 border-b bg-transparent backdrop-blur-sm">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 lg:px-6">
        <Link href="/" className="shrink-0" aria-label="BGSB Home">
          <img
            src="https://bgsb.lk/bgs-logo.png"
            alt="British Graduates School of Business"
            className="h-14 w-auto max-w-[190px] object-contain"
          />
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={dark ? "Use light mode" : "Use dark mode"}
          title={dark ? "Light mode" : "Dark mode"}
          className="grid size-11 place-items-center rounded-xl border text-navy"
        >
          {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </button>
      </div>
    </header>
  );
}
