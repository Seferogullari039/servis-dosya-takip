import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface LoginPageShellProps {
  children: ReactNode;
}

export function LoginPageShell({ children }: LoginPageShellProps) {
  return (
    <div className="relative flex min-h-[100dvh] min-h-screen w-full flex-col overflow-x-hidden bg-[#03060c]">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#050a12] via-[#0c1a2e] to-[#000000]"
        aria-hidden
      />
      <div
        className="login-grid pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-1/4 top-0 h-[28rem] w-[28rem] rounded-full bg-[#0F4C81]/20 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-[24rem] w-[24rem] rounded-full bg-[#1a6aad]/15 blur-[90px]"
        aria-hidden
      />

      <div className="absolute right-3 top-3 z-20 pt-safe sm:right-5 sm:top-5">
        <ThemeToggle compact />
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        {children}
      </div>
    </div>
  );
}
