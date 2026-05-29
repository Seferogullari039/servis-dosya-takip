"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface ImagePreviewModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function ImagePreviewModal({
  url,
  title,
  onClose,
}: ImagePreviewModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Kapat"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-3xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="truncate text-sm font-medium text-white">{title}</p>
          <Button type="button" variant="secondary" onClick={onClose}>
            Kapat
          </Button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={title}
          className="max-h-[calc(90vh-48px)] w-full rounded-lg object-contain"
        />
      </div>
    </div>
  );
}
