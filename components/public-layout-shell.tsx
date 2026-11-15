"use client";

import { usePathname } from "next/navigation";
import { BgsbFooter } from "./bgsb-footer";
import { PublicNav } from "./public-nav";

export function PublicLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(),
    loginPage = ["/login", "/password-forgot", "/password-reset"].includes(pathname ?? "");
  return (
    <>
      {!loginPage && <PublicNav />}
      {children}
      {!loginPage && <BgsbFooter />}
    </>
  );
}
