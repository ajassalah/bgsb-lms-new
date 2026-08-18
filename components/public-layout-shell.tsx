"use client";

import { usePathname } from "next/navigation";
import { BgsbFooter } from "./bgsb-footer";
import { PublicNav } from "./public-nav";

export function PublicLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(),
    loginPage = pathname === "/login";
  return (
    <>
      <PublicNav />
      {children}
      {!loginPage && <BgsbFooter />}
    </>
  );
}
