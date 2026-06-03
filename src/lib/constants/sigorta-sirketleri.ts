export const SIGORTA_SIRKETLERI = [
  "Türkiye Sigorta",
  "AXA Sigorta",
  "Anadolu Sigorta",
  "Allianz Sigorta",
  "Sompo Sigorta",
  "Mapfre Sigorta",
  "HDI Sigorta",
  "Quick Sigorta",
  "Zurich Sigorta",
  "Ray Sigorta",
  "Ak Sigorta",
  "Generali Sigorta",
  "Diğer",
] as const;

export type SigortaSirketiSecim = (typeof SIGORTA_SIRKETLERI)[number];

export const SIGORTA_SIRKETI_DIGER = "Diğer" as const;
