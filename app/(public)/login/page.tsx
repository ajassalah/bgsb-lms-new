import { LoginForm } from "@/components/login-form";

export default function Login() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-12 sm:px-8">
      <img
        src="/login page bg.png"
        alt="bgs-background"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-navy/35" />
      <section className="relative w-full max-w-md rounded-3xl border border-white/40 bg-white/75 p-7 shadow-2xl shadow-navy/30 backdrop-blur-: sm blur(2px) sm:p-10">
        <LoginForm />
      </section>
    </main>
  );
}
