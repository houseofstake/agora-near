"use client";

import { useEffect, useState } from "react";
// eslint-disable-next-line @next/next/no-img-element
import { Skeleton } from "@/components/ui/skeleton";

interface OGData {
  title: string;
  description: string;
  image: string;
  url: string;
}

export function LinkPreview({ url }: { url?: string }) {
  const [data, setData] = useState<OGData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url || !url.startsWith("http")) {
      setData(null);
      setError(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `/api/og-preview?url=${encodeURIComponent(url)}`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const ogData = await res.json();
        if (ogData.title || ogData.image) {
          setData(ogData);
        } else {
          setData(null);
        }
      } catch (err) {
        console.error(err);
        setError(true);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchData, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [url]);

  if (!url || (!data && !loading)) return null;

  if (loading) {
    return <Skeleton className="w-full h-24 rounded-md mt-2" />;
  }

  if (error || !data) return null;

  return (
    <div className="flex gap-4 border border-line rounded-md p-3 mt-2 bg-wash items-center">
      {data.image && (
        <div className="relative w-20 h-20 shrink-0">
          <img
            src={data.image}
            alt={data.title}
            className="object-cover w-full h-full rounded-sm"
          />
        </div>
      )}
      <div className="flex flex-col overflow-hidden">
        <h5 className="font-semibold text-sm truncate text-primary">
          {data.title}
        </h5>
        <p className="text-xs text-secondary line-clamp-2">
          {data.description}
        </p>
        <span className="text-[10px] text-tertiary mt-1 truncate">
          {data.url}
        </span>
      </div>
    </div>
  );
}
