"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function record(payload: {
  action: "visit" | "click";
  path: string;
  label?: string;
  target?: string;
}) {
  void fetch("/api/activity", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}

export function ActivityTracker() {
  const pathname = usePathname();
  const lastVisit = useRef("");

  useEffect(() => {
    if (!pathname || !pathname.startsWith("/dashboard/") || lastVisit.current === pathname)
      return;
    lastVisit.current = pathname;
    record({ action: "visit", path: pathname });
  }, [pathname]);

  useEffect(() => {
    function clicked(event: MouseEvent) {
      if (!window.location.pathname.startsWith("/dashboard/")) return;
      const element = (
        event.target as HTMLElement | null
      )?.closest<HTMLElement>("a,button,[role='button']");
      if (
        !element ||
        element.getAttribute("aria-disabled") === "true" ||
        (element as HTMLButtonElement).disabled
      )
        return;
      const raw =
        element.getAttribute("aria-label") ||
        element.getAttribute("title") ||
        element.textContent ||
        "";
      const label = raw.replace(/\s+/g, " ").trim().slice(0, 180);
      if (!label) return;
      const href =
        element instanceof HTMLAnchorElement
          ? element.getAttribute("href") || undefined
          : undefined;
      record({
        action: "click",
        path: window.location.pathname,
        label,
        target: href,
      });
    }
    document.addEventListener("click", clicked, true);
    return () => document.removeEventListener("click", clicked, true);
  }, []);

  return null;
}
