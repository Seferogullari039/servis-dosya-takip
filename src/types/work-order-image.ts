export type WorkOrderImageCategory =
  | "Hasar"
  | "Araç Genel"
  | "Ekspertiz"
  | "Parça"
  | "Teslim Öncesi"
  | "Teslim Sonrası";

export const WORK_ORDER_IMAGE_CATEGORIES: WorkOrderImageCategory[] = [
  "Hasar",
  "Araç Genel",
  "Ekspertiz",
  "Parça",
  "Teslim Öncesi",
  "Teslim Sonrası",
];

export const DEFAULT_IMAGE_CATEGORY: WorkOrderImageCategory = "Hasar";

export function isWorkOrderImageCategory(
  value: unknown
): value is WorkOrderImageCategory {
  return (
    typeof value === "string" &&
    (WORK_ORDER_IMAGE_CATEGORIES as string[]).includes(value)
  );
}

export interface WorkOrderImage {
  id: string;
  workOrderId: string;
  imageUrl: string;
  storagePath: string;
  category: WorkOrderImageCategory;
  note: string | null;
  createdAt: string;
}

export interface WorkOrderImageStats {
  toplamGorsel: number;
  bugunYuklenen: number;
  eksikFotografliDosya: number;
}

/** PDF çıktısında gösterilecek hasar + ekspertiz görselleri */
export function filterImagesForPdf(images: WorkOrderImage[]): WorkOrderImage[] {
  return images.filter(
    (img) => img.category === "Hasar" || img.category === "Ekspertiz"
  );
}
