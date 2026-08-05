"use client";
import { useEffect } from "react";

export function FloatingActionMenus() {
  useEffect(() => {
    function positionMenus() {
      document.querySelectorAll<HTMLElement>("div.absolute").forEach((menu) => {
        if (menu.dataset.floatingAction === "true") return;
        const parent = menu.parentElement;
        const trigger = parent?.querySelector<HTMLElement>(
          "button:has(.lucide-more-vertical),button:has(.lucide-ellipsis-vertical),button:has(.lucide-more-horizontal),button:has(.lucide-ellipsis)",
        );
        if (!trigger) return;
        const triggerBox = trigger.getBoundingClientRect();
        const width = Math.max(menu.offsetWidth, 144);
        let left = Math.min(
          window.innerWidth - width - 12,
          Math.max(12, triggerBox.right - width),
        );
        let top = triggerBox.bottom + 6;
        const estimatedHeight = Math.max(menu.offsetHeight, 120);
        if (top + estimatedHeight > window.innerHeight - 12)
          top = Math.max(12, triggerBox.top - estimatedHeight - 6);
        menu.dataset.floatingAction = "true";
        Object.assign(menu.style, {
          position: "fixed",
          inset: "auto auto auto auto",
          right: "auto",
          bottom: "auto",
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          zIndex: "9999",
        });
      });
    }
    const observer = new MutationObserver(() =>
      requestAnimationFrame(positionMenus),
    );
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", positionMenus, true);
    window.addEventListener("resize", positionMenus);
    return () => {
      observer.disconnect();
      document.removeEventListener("click", positionMenus, true);
      window.removeEventListener("resize", positionMenus);
    };
  }, []);
  return null;
}
