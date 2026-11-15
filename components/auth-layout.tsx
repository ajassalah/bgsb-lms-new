import type { ReactNode } from "react";

/** Atlassian-style auth screen: quiet page, centred card, decorative corner shapes. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main
      className="ds-public ds-login relative flex min-h-screen flex-col items-center overflow-hidden bg-[#FAFBFC] px-4 pb-10 pt-12 sm:pt-16"
      style={{ fontFamily: "var(--font-ui), system-ui, sans-serif" }}
    >
      {/* Decorative shapes (original artwork, BGSB blues) */}
      <svg
        aria-hidden
        viewBox="0 0 400 400"
        className="ds-login-art pointer-events-none absolute -bottom-24 -left-24 hidden w-[420px] md:block"
      >
        <circle cx="140" cy="260" r="140" fill="#DEEBFF" />
        <rect x="190" y="120" width="120" height="120" rx="12" fill="#B3D4FF" transform="rotate(18 250 180)" />
        <circle cx="90" cy="130" r="36" fill="#4C9AFF" opacity="0.55" />
      </svg>
      <svg
        aria-hidden
        viewBox="0 0 400 400"
        className="ds-login-art pointer-events-none absolute -bottom-20 -right-20 hidden w-[400px] md:block"
      >
        <path d="M400 120 L400 400 L120 400 Q200 220 400 120Z" fill="#DEEBFF" />
        <circle cx="270" cy="250" r="64" fill="#B3D4FF" />
        <rect x="150" y="300" width="70" height="70" rx="10" fill="#0052CC" opacity="0.18" transform="rotate(-14 185 335)" />
      </svg>

      <div className="relative z-10 w-full max-w-[400px]">
        <section className="ds-card rounded-[3px] bg-white px-6 py-8 shadow-[0_0_10px_rgba(0,0,0,0.1)] sm:px-10">
          {children}
        </section>
        <footer className="mt-6 text-center text-xs leading-5 text-[#6B778C]">
          <p>British Graduates School of Business</p>
          <p className="mt-1 space-x-2">
            <a href="/" className="text-[#0052CC] hover:underline">
              Home
            </a>
            <span aria-hidden>•</span>
            <a href="/terms-and-conditions" className="text-[#0052CC] hover:underline">
              Terms and conditions
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}

/** Shared Atlassian field / button classes for the auth forms. */
export const authInput =
  "h-10 w-full rounded-[3px] border-2 border-[#DFE1E6] bg-[#FAFBFC] px-2 text-sm text-[#172B4D] outline-none transition-colors placeholder:text-[#7A869A] hover:bg-[#EBECF0] focus:border-[#4C9AFF] focus:bg-white disabled:cursor-not-allowed disabled:bg-[#F4F5F7] disabled:text-[#A5ADBA]";
export const authLabel = "mb-1 block text-xs font-semibold text-[#6B778C]";
export const authButton =
  "flex h-10 w-full items-center justify-center rounded-[3px] bg-[#0052CC] text-sm font-medium text-white transition-colors hover:bg-[#0065FF] active:bg-[#0747A6] disabled:cursor-wait disabled:bg-[#091E420F] disabled:text-[#A5ADBA]";
export const authHeadingStyle = {
  fontFamily: "var(--font-ui), system-ui, sans-serif",
  letterSpacing: "normal",
} as const;

export function AuthHeader({ title }: { title: string }) {
  return (
    <div className="text-center">
      <img src="/bgs logo.png" alt="BGSB" className="mx-auto h-12 w-auto object-contain" />
      <h1 className="mt-6 text-base font-semibold text-[#5E6C84]" style={authHeadingStyle}>
        {title}
      </h1>
    </div>
  );
}
