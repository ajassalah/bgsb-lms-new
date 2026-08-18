"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
export function CollapsibleMedia({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
        title={`${expanded ? "Collapse" : "Expand"} ${label}`}
        className="mb-3 grid size-9 place-items-center rounded-lg border bg-white text-blue-600"
      >
        <ChevronDown
          className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && children}
    </div>
  );
}
