"use client";
import { useMemo, useState } from "react";
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
    [query, setQuery] = useState("");
  const choices = useMemo(
    () => options.filter((x) => x.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  );
  return (
    <div className={`relative mt-2 ${open ? "z-[500]" : "z-0"}`}>
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        className="field flex items-center justify-between text-left"
      >
        <span>{value || "Select role"}</span>
        <ChevronDown className="size-4" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-[510] mt-2 w-full rounded-xl border bg-white p-2 shadow-2xl">
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
        </div>
      )}
    </div>
  );
}
