import type { ReactNode } from "react";
import { LoginHero } from "@/components/auth/LoginHero";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface LoginPageShellProps {
  children: ReactNode;
}

export function LoginPageShell({ children }: LoginPageShellProps) {
  return (
    <div className="relative flex min-h-[100dvh] min-h-screen w-full flex-col overflow-x-hidden bg-[#020610]">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#030812] via-[#0a1830] to-[#02040a]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_15%_20%,rgba(15,76,129,0.35),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_85%_80%,rgba(26,106,173,0.2),transparent_60%)]"
        aria-hidden
      />
      <div
        className="login-grid pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      />

      <div
        className="login-orb pointer-events-none absolute -left-32 top-[8%] h-[26rem] w-[26rem] rounded-full bg-[#0F4C81]/25 blur-[110px]"
        aria-hidden
      />
      <div
        className="login-orb login-orb-delay pointer-events-none absolute -right-24 bottom-[5%] h-[22rem] w-[22rem] rounded-full bg-[#1a6aad]/20 blur-[100px]"
        aria-hidden
      />
      <div
        className="login-orb-slow pointer-events-none absolute left-[40%] top-[55%] h-48 w-48 rounded-full bg-[#4a9fd4]/10 blur-[80px]"
        aria-hidden
      />

      <div className="absolute right-3 top-3 z-20 pt-safe sm:right-5 sm:top-5">
        <ThemeToggle compact />
      </div>

      <div className="relative z-10 flex min-h-[100dvh] flex-1 flex-col lg:flex-row">
        <div className="order-2 flex flex-1 items-center lg:order-1 lg:max-w-[65%] lg:flex-[1.75] lg:items-start lg:justify-center">
          <LoginHero className="hidden w-full lg:flex lg:justify-start lg:py-8 lg:pl-6 xl:py-10 xl:pl-10" />
          <LoginHero className="w-full border-t border-white/[0.06] lg:hidden" compact />
        </div>

        <div className="order-1 flex flex-1 items-center justify-center px-4 pb-6 pt-14 sm:px-6 sm:pb-8 lg:order-2 lg:max-w-[35%] lg:flex-1 lg:shrink-0 lg:px-8 lg:py-12 xl:px-12">
          {children}
        </div>
      </div>
    </div>
  );
}
