import { LoginForm } from "@/components/login-form";

/** Atlassian-style login: quiet page, centred card, decorative corner shapes. */
export default function Login() {
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
          <LoginForm />
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
