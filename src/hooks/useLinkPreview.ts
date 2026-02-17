import { useQuery } from "@tanstack/react-query";

export interface LinkMetadata {
  title?: string;
  description?: string;
  image?: string;
}

export function useLinkPreview(url: string | null) {
  return useQuery({
    queryKey: ["linkPreview", url],
    queryFn: async (): Promise<LinkMetadata | null> => {
      if (!url) return null;

      try {
        const parsedUrl = new URL(url);
        const allowed = ["gov.near.org", "github.com"].includes(
          parsedUrl.hostname
        );
        if (!allowed) return null;
      } catch {
        return null;
      }

      const res = await fetch(`/api/og-preview?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error("Failed to fetch metadata");
      return res.json();
    },
    enabled: !!url,
    staleTime: 1000 * 60 * 60,
    retry: false,
  });
}
