import type { WorkOrderImage } from "@/types/work-order-image";

function formatShortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

interface WorkOrderImagePrintBlockProps {
  images: WorkOrderImage[];
}

export function WorkOrderImagePrintBlock({
  images,
}: WorkOrderImagePrintBlockProps) {
  if (images.length === 0) return null;

  return (
    <section className="break-inside-avoid">
      <h3 className="is-emri-doc-images-title">Hasar ve ekspertiz görselleri</h3>
      <div className="is-emri-doc-images-grid">
        {images.map((img) => (
          <figure
            key={img.id}
            className="overflow-hidden rounded border border-border print:border-gray-300"
          >
            {/* html2pdf: native img */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.imageUrl}
              alt={img.category}
              className="h-20 w-full object-cover print:h-16"
              loading="lazy"
            />
            <figcaption className="px-1 py-0.5 text-[9px] leading-tight text-ink-muted print:text-gray-600">
              <span className="font-semibold">{img.category}</span>
              <span className="block">{formatShortDate(img.createdAt)}</span>
              {img.note ? (
                <span className="line-clamp-2">{img.note}</span>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
