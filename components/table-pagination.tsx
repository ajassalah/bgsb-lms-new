"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function TablePagination({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-t px-4 py-4">
      {page > 1 && (
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          className="btn-secondary gap-1"
        >
          <ChevronLeft className="size-4" />
          Previous
        </button>
      )}
      {Array.from({ length: total }, (_, index) => index + 1).map((number) => (
        <button
          type="button"
          key={number}
          onClick={() => onChange(number)}
          className={`grid size-9 place-items-center rounded-lg border text-sm font-semibold ${number === page ? "border-red bg-red text-white" : "bg-white text-slate-600"}`}
        >
          {number}
        </button>
      ))}
      {page < total && (
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          className="btn-secondary gap-1"
        >
          Next
          <ChevronRight className="size-4" />
        </button>
      )}
    </div>
  );
}
