"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/DataState";
import { ERROR_UI, toUserFriendlyError } from "@/lib/errors/user-messages";
import { logger } from "@/lib/logging";

interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DosyaDetayRouteError({
  error,
  reset,
}: RouteErrorProps) {
  useEffect(() => {
    logger.error("dosya detay route error", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-6">
      <ErrorState
        title={ERROR_UI.dosyaDetay.title}
        description={toUserFriendlyError(error, ERROR_UI.dosyaDetay.description)}
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={reset}>Tekrar dene</Button>
        <Link href="/dosyalar">
          <Button variant="secondary">Dosya listesine dön</Button>
        </Link>
      </div>
    </div>
  );
}
