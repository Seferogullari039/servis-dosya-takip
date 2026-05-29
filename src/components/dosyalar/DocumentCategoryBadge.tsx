import { cn } from "@/lib/utils/cn";
import {
  DOCUMENT_CATEGORY_LABELS,
  type DocumentCategory,
} from "@/types/documents";

const categoryColors: Record<DocumentCategory, string> = {
  eksper:
    "bg-orange-50 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300",
  evrak: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
  odeme:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300",
  fotograf:
    "bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300",
  diger:
    "bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300",
};

export function DocumentCategoryBadge({
  category,
}: {
  category: DocumentCategory;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        categoryColors[category]
      )}
    >
      {DOCUMENT_CATEGORY_LABELS[category]}
    </span>
  );
}
