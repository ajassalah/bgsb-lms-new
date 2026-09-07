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

export function DashboardLoadingVisual() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className="dashboard-route-loader fixed inset-0 z-[30000] grid place-items-center bg-[#07111f]/95 p-6 backdrop-blur-md"
    >
      <div className="text-center">
        <div className="dashboard-loader-mark relative mx-auto grid size-28 place-items-center rounded-full sm:size-32">
          <span className="dashboard-loader-ring absolute inset-0 rounded-full border-2 border-white/15 border-t-red" />
          <span className="absolute inset-2 rounded-full border border-white/10" />
          <img
            src="/BGS Logo White-01.png"
            alt="BGSB"
            className="dashboard-loader-logo relative z-10 h-16 w-20 object-contain sm:h-20 sm:w-24"
          />
        </div>
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.28em] text-white">
          Loading
        </p>
        <div className="mx-auto mt-3 flex w-fit gap-1.5" aria-hidden="true">
          <span className="dashboard-loader-dot size-2 rounded-full bg-red" />
          <span className="dashboard-loader-dot size-2 rounded-full bg-red" />
          <span className="dashboard-loader-dot size-2 rounded-full bg-red" />
        </div>
      </div>
    </div>
  );
}
