import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { MobileTableCards } from "@/components/mobile-table-cards";
import { FloatingActionMenus } from "@/components/floating-action-menus";
import { SessionInactivity } from "@/components/session-inactivity";
import { ActivityTracker } from "@/components/activity-tracker";

export const metadata: Metadata = {
  title: {
    default: "BGSB Learning",
    template: "%s | BGSB Learning",
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
            __html: `(function(){try{var t=localStorage.getItem('bgsb-admin-theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('admin-dark',d)}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <MobileTableCards />
        <FloatingActionMenus />
        <SessionInactivity />
        <ActivityTracker />
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
