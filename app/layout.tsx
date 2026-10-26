// @ts-ignore Next.js loads global CSS at runtime; TypeScript may not have a CSS module declaration.
import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { MobileTableCards } from "@/components/mobile-table-cards";
import { FloatingActionMenus } from "@/components/floating-action-menus";
import { SessionInactivity } from "@/components/session-inactivity";
import { ActivityTracker } from "@/components/activity-tracker";
import { DashboardNavigationLoader } from "@/components/dashboard-navigation-loader";
import { PortalEntryNotification } from "@/components/portal-entry-notification";

export const metadata: Metadata = {
  title: {
    default: "BGSB LMS",
    template: "%s | BGSB LMS",
  },
  description: "British Graduates School of Business learning platform",
  icons: {
    icon: "/bgs%20logo.png",
    shortcut: "/bgs%20logo.png",
    apple: "/bgs%20logo.png",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var a=location.pathname.indexOf('/dashboard')===0;var t=localStorage.getItem(a?'bgsb-admin-theme':'bgsb-public-theme');var d=t?t==='dark':a&&matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('admin-dark',d)}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <MobileTableCards />
        <FloatingActionMenus />
        <SessionInactivity />
        <ActivityTracker />
        <DashboardNavigationLoader />
        <PortalEntryNotification />
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
