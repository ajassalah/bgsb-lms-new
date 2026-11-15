"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function DashboardNavigationLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const timeout = useRef<number>();

  useEffect(() => {
    setLoading(false);
    if (timeout.current) window.clearTimeout(timeout.current);
  }, [pathname]);

  useEffect(() => {
    function navigate(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = (
        event.target as Element | null
      )?.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        !anchor.closest("[data-admin-shell]") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        !destination.pathname.startsWith("/dashboard/") ||
        `${destination.pathname}${destination.search}` ===
          `${window.location.pathname}${window.location.search}`
      )
        return;
      setLoading(true);
      if (timeout.current) window.clearTimeout(timeout.current);
      timeout.current = window.setTimeout(() => setLoading(false), 10000);
    }
    document.addEventListener("click", navigate, true);
    return () => {
      document.removeEventListener("click", navigate, true);
      if (timeout.current) window.clearTimeout(timeout.current);
    };
  }, []);

  if (!loading) return null;
  return <DashboardLoadingVisual />;
}

/** Atlassian-style page transition: thin brand progress bar + spinner. */
export function DashboardLoadingVisual() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading page" className="ds-route-loader">
      <span className="ds-route-progress" aria-hidden="true" />
      <span className="ds-route-blanket" aria-hidden="true" />
      <span className="ds-route-spinner-wrap">
        <svg className="ds-spinner" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="7" />
        </svg>
        <span className="sr-only">Loading</span>
      </span>
    </div>
  );
}
