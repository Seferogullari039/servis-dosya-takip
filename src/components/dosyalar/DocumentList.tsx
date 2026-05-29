import { DocumentCard } from "@/components/dosyalar/DocumentCard";
import { DocumentUploadForm } from "@/components/dosyalar/DocumentUploadForm";
import { EmptyState, ErrorState } from "@/components/ui/DataState";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { PaginatedDocuments } from "@/types/documents";

interface DocumentListProps {
  serviceFileId: string;
  documents: PaginatedDocuments | null;
  error?: string | null;
  isAdmin: boolean;
}

export function DocumentList({
  serviceFileId,
  documents,
  error,
  isAdmin,
}: DocumentListProps) {
  return (
    <div className="space-y-6">
      <DocumentUploadForm serviceFileId={serviceFileId} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Yüklenen Evraklar</CardTitle>
          {documents && (
            <span className="text-xs text-ink-muted">{documents.total} dosya</span>
          )}
        </CardHeader>

        {error && (
          <ErrorState title="Evraklar yüklenemedi" description={error} />
        )}

        {!error && documents && documents.items.length === 0 && (
          <EmptyState
            title="Henüz evrak yok"
            description="Bu dosyaya PDF veya görsel yükleyebilirsiniz."
          />
        )}

        {!error && documents && documents.items.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {documents.items.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  serviceFileId={serviceFileId}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
            {documents.hasMore && (
              <p className="mt-4 border-t border-border pt-3 text-center text-xs text-ink-muted">
                Daha fazla evrak mevcut (sayfa {documents.page})
              </p>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
