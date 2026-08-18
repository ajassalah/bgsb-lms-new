"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LIMIT_MS = 30 * 60 * 1000;
const ACTIVITY_KEY = "bgsb-last-activity";

export function SessionInactivity() {
  const pathname = usePathname();
  const signingOut = useRef(false);

  useEffect(() => {
    if (!pathname?.startsWith("/dashboard")) return;
    const db = createClient();
    let lastWrite = 0;
    const recordActivity = () => {
      const now = Date.now();
      if (now - lastWrite < 5000) return;
      lastWrite = now;
      localStorage.setItem(ACTIVITY_KEY, String(now));
    };
    const expire = async () => {
      if (signingOut.current) return;
      signingOut.current = true;
      await fetch("/api/login-history", {
        method: "DELETE",
        keepalive: true,
      }).catch(() => null);
      await db.auth.signOut().catch(() => null);
      localStorage.removeItem(ACTIVITY_KEY);
      window.location.replace("/login?session=expired");
    };
    const check = () => {
      const last = Number(localStorage.getItem(ACTIVITY_KEY) || 0);
      if (!last) return recordActivity();
      if (Date.now() - last >= LIMIT_MS) void expire();
    };
    const events: (keyof WindowEventMap)[] = [
      "pointerdown",
      "mousemove",
      "keydown",
      "touchstart",
      "scroll",
    ];
    events.forEach((event) =>
      window.addEventListener(event, recordActivity, { passive: true }),
    );
    window.addEventListener("focus", check);
    window.addEventListener("storage", check);
    document.addEventListener("visibilitychange", check);
    check();
    const timer = window.setInterval(check, 15000);
    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, recordActivity),
      );
      window.removeEventListener("focus", check);
      window.removeEventListener("storage", check);
      document.removeEventListener("visibilitychange", check);
      window.clearInterval(timer);
    };
  }, [pathname]);

  return null;
}
