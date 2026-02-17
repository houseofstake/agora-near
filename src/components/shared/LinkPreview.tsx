import { useLinkPreview } from "@/hooks/useLinkPreview";
import { VStack } from "@/components/Layout/Stack";
import LoadingSpinner from "./LoadingSpinner";

export default function LinkPreview({ url }: { url: string }) {
  const {
    data: metadata,
    isLoading: loading,
    isError: error,
  } = useLinkPreview(url);

  if (!url) return null;
  if (loading)
    return (
      <div className="p-4 bg-wash rounded-lg border border-line">
        <LoadingSpinner />
      </div>
    );
  if (error || !metadata) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-wash rounded-lg border border-line overflow-hidden">
      {metadata.image && (
        <div className="relative w-full sm:w-32 h-20 shrink-0">
          <img
            src={metadata.image}
            alt={metadata.title || "Preview"}
            className="object-cover w-full h-full rounded"
          />
        </div>
      )}
      <VStack gap={1} className="min-w-0">
        <h4 className="text-sm font-bold text-primary truncate">
          {metadata.title || "No title found"}
        </h4>
        <p className="text-xs text-secondary line-clamp-2">
          {metadata.description || "No description available"}
        </p>
        <span className="text-[10px] text-tertiary truncate">{url}</span>
      </VStack>
    </div>
  );
}
