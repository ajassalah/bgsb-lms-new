"use client";
import { useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

export function InstructorPicker({
  instructors,
  selected,
  onChange,
}: {
  instructors: { id: string; name: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState("");
  const filtered = instructors.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );
  function toggle(id: string) {
    onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id],
    );
  }
  return (
    <div className="relative">
      <label className="text-sm font-semibold">Instructors</label>
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        className="field mt-2 flex min-h-11 items-center justify-between text-left"
      >
        <span className={selected.length ? "text-slate-700" : "text-slate-400"}>
          {selected.length
            ? `${selected.length} instructors selected`
            : "Select instructors"}
        </span>
        <ChevronDown className="size-4" />
      </button>
      {!!selected.length && (
        <div className="mt-2 flex flex-wrap gap-2">
          {instructors
            .filter((x) => selected.includes(x.id))
            .map((x) => (
              <button
                type="button"
                key={x.id}
                onClick={() => toggle(x.id)}
                className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
              >
                {x.name}
                <X className="size-3" />
              </button>
            ))}
        </div>
      )}
      {open && (
        <div className="absolute z-[80] mt-2 w-full rounded-xl border bg-white p-2 shadow-2xl">
          <label className="flex items-center gap-2 rounded-lg border px-3">
            <Search className="size-4 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 min-w-0 flex-1 outline-none"
              placeholder="Search instructors..."
            />
          </label>
          <div className="mt-2 max-h-52 overflow-y-auto">
            {filtered.map((x) => (
              <button
                type="button"
                key={x.id}
                onClick={() => toggle(x.id)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm hover:bg-slate-50"
              >
                <span
                  className={`grid size-5 place-items-center rounded border ${selected.includes(x.id) ? "border-red bg-red text-white" : "border-slate-300"}`}
                >
                  {selected.includes(x.id) && <Check className="size-3" />}
                </span>
                {x.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
