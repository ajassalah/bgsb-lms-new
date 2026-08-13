"use client";
import { useEffect } from "react";

export function FloatingActionMenus() {
  useEffect(() => {
    const triggerSelector =
      "button:has(.lucide-more-vertical),button:has(.lucide-ellipsis-vertical),button:has(.lucide-more-horizontal),button:has(.lucide-ellipsis)";
    function triggerFor(menu: HTMLElement) {
      return menu.parentElement?.querySelector<HTMLElement>(triggerSelector);
    }
    function closeMenus(except?: HTMLElement | null) {
      document
        .querySelectorAll<HTMLElement>('[data-floating-action="true"]')
        .forEach((menu) => {
          if (except && (menu === except || menu.contains(except))) return;
          triggerFor(menu)?.click();
        });
    }
    function positionMenus() {
      document.querySelectorAll<HTMLElement>("div.absolute").forEach((menu) => {
        if (menu.dataset.floatingAction === "true") return;
        const parent = menu.parentElement;
        const trigger = parent?.querySelector<HTMLElement>(triggerSelector);
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
    function outside(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const clickedMenu = target.closest<HTMLElement>(
        '[data-floating-action="true"]',
      );
      if (clickedMenu) return;
      const clickedTrigger = target.closest<HTMLElement>(triggerSelector);
      closeMenus(clickedTrigger);
    }
    function keyboard(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenus();
    }
    function scroll() {
      closeMenus();
    }
    const observer = new MutationObserver(() =>
      requestAnimationFrame(positionMenus),
    );
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", positionMenus, true);
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("keydown", keyboard);
    window.addEventListener("scroll", scroll, true);
    window.addEventListener("resize", positionMenus);
    return () => {
      observer.disconnect();
      document.removeEventListener("click", positionMenus, true);
      document.removeEventListener("pointerdown", outside, true);
      document.removeEventListener("keydown", keyboard);
      window.removeEventListener("scroll", scroll, true);
      window.removeEventListener("resize", positionMenus);
    };
  }, []);
  return null;
}
