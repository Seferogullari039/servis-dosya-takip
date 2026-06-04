"use client";

import Link from "next/link";
import { useState } from "react";
import { CORPORATE_BRAND, CORPORATE_NAV } from "@/lib/corporate-site";
import { cn } from "@/lib/utils/cn";

export function CorporateHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#020610]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a9fd4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020610]"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7eb8e8]">
            {CORPORATE_BRAND.name}
          </span>
          <span className="text-sm font-medium text-white/80 group-hover:text-white">
            {CORPORATE_BRAND.tagline}
          </span>
        </Link>

        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Kurumsal menü"
        >
          {CORPORATE_NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-sm font-medium text-white/75 transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/login"
            className="rounded-lg bg-[#0F4C81] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#0F4C81]/30 transition-colors hover:bg-[#1a6aad] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a9fd4]"
          >
            Personel Girişi
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white md:hidden"
          aria-expanded={open}
          aria-controls="corporate-mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menü</span>
          <span className="text-lg" aria-hidden>
            {open ? "✕" : "☰"}
          </span>
        </button>
      </div>

      <div
        id="corporate-mobile-nav"
        className={cn(
          "border-t border-white/[0.08] bg-[#030812]/95 md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3" aria-label="Mobil menü">
          {CORPORATE_NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/5"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/login"
            className="mt-2 rounded-lg bg-[#0F4C81] px-3 py-2.5 text-center text-sm font-semibold text-white"
            onClick={() => setOpen(false)}
          >
            Personel Girişi
          </Link>
        </nav>
      </div>
    </header>
  );
}
