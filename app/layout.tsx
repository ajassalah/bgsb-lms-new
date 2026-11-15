// @ts-ignore Next.js loads global CSS at runtime; TypeScript may not have a CSS module declaration.
import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import { MobileTableCards } from "@/components/mobile-table-cards";
import { FloatingActionMenus } from "@/components/floating-action-menus";
import { SessionInactivity } from "@/components/session-inactivity";
import { ActivityTracker } from "@/components/activity-tracker";
import { DashboardNavigationLoader } from "@/components/dashboard-navigation-loader";
import { PortalEntryNotification } from "@/components/portal-entry-notification";

// App-wide UI font (Inter, the open-source base of Atlassian Sans). Declared here so its
// CSS ships in the root layout chunk that every page loads.
const uiFont = Inter({ subsets: ["latin"], variable: "--font-ui", display: "swap" });

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
      <body className={uiFont.variable}>
        <MobileTableCards />
        <FloatingActionMenus />
        <SessionInactivity />
        <ActivityTracker />
        <DashboardNavigationLoader />
        <PortalEntryNotification />
        {children}
        <Toaster
          position="bottom-right"
          closeButton
          gap={8}
          duration={5000}
          toastOptions={{ className: "ds-flag" }}
        />
      </body>
    </html>
  );
}
