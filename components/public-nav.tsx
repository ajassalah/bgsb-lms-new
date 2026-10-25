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
    <header className="public-nav sticky top-0 z-50 border-b bg-transparent backdrop-blur-sm">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="shrink-0" aria-label="BGSB Home">
          <img
            src="/bgsb-logo-trimmed.png"
            alt="British Graduates School of Business"
            className="h-12 w-auto object-contain"
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
