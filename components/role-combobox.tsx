"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Plus, Search } from "lucide-react";
export const defaultRoleNames = ["Admin", "Manager", "Academic Coordinator"];
export function RoleCombobox({
  value,
  onChange,
  options = defaultRoleNames,
  onAddNew,
}: {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  onAddNew?: () => void;
}) {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [position, setPosition] = useState({ left: 12, top: 60, width: 280 }),
    buttonRef = useRef<HTMLButtonElement>(null),
    panelRef = useRef<HTMLDivElement>(null);
  const choices = useMemo(
    () => options.filter((x) => x.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  );
  function openDropdown() {
    if (open) return setOpen(false);
    const box = buttonRef.current?.getBoundingClientRect();
    if (box) {
      const width = Math.min(Math.max(box.width, 240), window.innerWidth - 24);
      const estimatedHeight = 320;
      const top =
        box.bottom + estimatedHeight <= window.innerHeight - 12
          ? box.bottom + 8
          : Math.max(12, box.top - estimatedHeight - 8);
      setPosition({
        left: Math.min(window.innerWidth - width - 12, Math.max(12, box.left)),
        top,
        width,
      });
    }
    setOpen(true);
  }
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      )
        return;
      setOpen(false);
    };
    const closeOnViewportChange = () => setOpen(false);
    document.addEventListener("pointerdown", close);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", close);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, [open]);
  return (
    <div className="relative mt-2">
      <button
        ref={buttonRef}
        type="button"
        onClick={openDropdown}
        className="field flex items-center justify-between text-left"
      >
        <span>{value || "Select role"}</span>
        <ChevronDown className="size-4" />
      </button>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={position}
            className="fixed z-[10010] max-h-[min(22rem,calc(100vh-24px))] overflow-y-auto rounded-xl border bg-white p-2 shadow-2xl"
          >
            <label className="flex items-center gap-2 rounded-lg border px-3">
              <Search className="size-4 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 min-w-0 flex-1 outline-none"
                placeholder="Search roles..."
              />
            </label>
            <div className="mt-2 max-h-52 overflow-y-auto">
              {choices.map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => {
                    onChange(role);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  {role}
                  {role === value && <Check className="size-4 text-red" />}
                </button>
              ))}
            </div>
            {onAddNew && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                  onAddNew();
                }}
                className="mt-2 flex w-full items-center gap-2 border-t px-3 pt-3 text-left text-sm font-bold text-red"
              >
                <Plus className="size-4" />
                Add New Role Name
              </button>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
