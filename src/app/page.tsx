import type { Metadata } from "next";
import { CorporateLanding } from "@/components/corporate/CorporateLanding";
import { BRAND } from "@/lib/brand";
import { CORPORATE_SEO } from "@/lib/corporate-site";

const ogImage = {
  url: "/icons/icon-512.png",
  width: 512,
  height: 512,
  alt: `${BRAND.companyName} — Lüleburgaz sigorta hasar ve onarım merkezi`,
};

export const metadata: Metadata = {
  title: CORPORATE_SEO.title,
  description: CORPORATE_SEO.description,
  keywords: [...CORPORATE_SEO.keywords],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: CORPORATE_SEO.title,
    description: CORPORATE_SEO.description,
    type: "website",
    locale: "tr_TR",
    siteName: BRAND.companyName,
    url: "/",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: CORPORATE_SEO.title,
    description: CORPORATE_SEO.description,
    images: [ogImage.url],
  },
};

export default function CorporateHomePage() {
  return <CorporateLanding />;
}
