"use client";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
export function SignOut({ light = false }: { light?: boolean }) {
  return (
    <button
      className={`flex w-full items-center gap-3 text-sm ${light ? "rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50" : "text-white/60 hover:text-white"}`}
      onClick={async () => {
        await createClient().auth.signOut();
        location.href = "/login";
      }}
    >
      <LogOut className="size-4" />
      Sign out
    </button>
  );
}
