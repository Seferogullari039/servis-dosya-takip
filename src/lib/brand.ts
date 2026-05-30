/** Uygulama ve PDF marka bilgileri */
export const BRAND = {
  companyName: "Seferoğulları Otomotiv",
  appTagline: "Dosya Takip Sistemi",
  panelSubtitle: "Operasyon Paneli",
  /** Kurumsal lacivert — iş emri, PWA, panel */
  corporateBlue: "#0F4C81",
  /** Sol menü — koyu lacivert (gece modundan bağımsız) */
  sidebarBg: "#0c1a2e",
} as const;

export const PDF_BRAND = {
  companyName: BRAND.companyName,
  blue: BRAND.corporateBlue,
  blueDark: "#0a3d66",
  blueLight: "#dbeafe",
  blueSoft: "#e8f2fa",
  dotColor: "#ffffff",
} as const;
