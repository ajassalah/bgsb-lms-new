"use client";

import { useEffect } from "react";

export function MobileTableCards() {
  useEffect(() => {
    function labelTables() {
      document.querySelectorAll<HTMLTableElement>("table").forEach((table) => {
        const headers = Array.from(table.querySelectorAll("thead th")).map(
          (header) => header.textContent?.trim() || "",
        );
        if (!headers.length) return;
        table.dataset.mobileCards = "true";
        table
          .closest<HTMLElement>(".overflow-x-auto")
          ?.setAttribute("data-mobile-table-wrap", "true");
        table
          .querySelectorAll<HTMLTableRowElement>("tbody tr")
          .forEach((row) => {
            row
              .querySelectorAll<HTMLTableCellElement>("td")
              .forEach((cell, i) => {
                if (cell.colSpan > 1) {
                  cell.dataset.mobileFull = "true";
                  return;
                }
                cell.dataset.mobileLabel = headers[i] || "";
              });
          });
      });
    }
    labelTables();
    const observer = new MutationObserver(labelTables);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
