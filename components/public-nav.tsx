"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const themeKey = "bgsb-public-theme";

export function PublicNav() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    // Public pages keep their own theme (light by default), separate from the portals.
    let enabled = false;
    try {
      enabled = localStorage.getItem(themeKey) === "dark";
    } catch {}
    setDark(enabled);
    document.documentElement.classList.toggle("admin-dark", enabled);
  }, []);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("admin-dark", next);
    try {
      localStorage.setItem(themeKey, next ? "dark" : "light");
    } catch {}
  }
  return (
    <header className="ds-public ds-nav sticky top-0 z-50 border-b border-[#DFE1E6] bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label="BGSB Home">
          <img
            src="/bgsb-logo-trimmed.png"
            alt="British Graduates School of Business"
            className="h-10 w-auto object-contain"
          />
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={dark ? "Use light mode" : "Use dark mode"}
            title={dark ? "Light mode" : "Dark mode"}
            className="grid size-10 place-items-center rounded-full text-[#42526E] transition-colors hover:bg-[#091E420F] hover:text-[#172B4D]"
          >
            {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
          <Link
            href="/login"
            className="inline-flex h-9 items-center rounded-[3px] bg-[#0052CC] px-4 text-sm font-medium text-white transition-colors hover:bg-[#0065FF] active:bg-[#0747A6]"
          >
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}
