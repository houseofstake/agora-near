"use client";

import { TextInputWithTooltip } from "@/components/shared/Form/TextInputWithTooltip";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useRef, useState } from "react";

const NEAR_ACCOUNT_REGEX = /^[a-z0-9._-]+\.near$/i;
const HEX_64_REGEX = /^[a-f0-9]{64}$/i;

function isNearAddress(input: string): boolean {
  const trimmed = input.trim();
  return (
    NEAR_ACCOUNT_REGEX.test(trimmed) || HEX_64_REGEX.test(trimmed)
  );
}

const DEBOUNCE_MS = 300;

export default function DelegatesSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useQueryState("q", {
    defaultValue: "",
    clearOnDefault: true,
  });
  const [localValue, setLocalValue] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { trackDelegateSearchPerformed } = useAnalytics();

  useEffect(() => {
    setLocalValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const debouncedSetQuery = useCallback((value: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      setSearchQuery(value.trim() || null, { scroll: false, shallow: false });
    }, DEBOUNCE_MS);
  }, [setSearchQuery]);

  const handleChange = useCallback((value: string) => {
    setLocalValue(value);
    if (isNearAddress(value)) return;
    debouncedSetQuery(value);
  }, [debouncedSetQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = localValue.trim();
    if (!trimmed) return;
    if (isNearAddress(trimmed)) {
      trackDelegateSearchPerformed({
        search_query: trimmed,
        results_count: 1,
      });
      router.push(`/delegates/${trimmed}`);
      return;
    }
    setSearchQuery(trimmed, { scroll: false, shallow: false });
    trackDelegateSearchPerformed({
      search_query: trimmed,
      results_count: 0,
    });
  };

  const handleClear = () => {
    setLocalValue("");
    setSearchQuery(null, { scroll: false, shallow: false });
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <div className="w-full sm:w-auto flex flex-row items-center relative">
        <div className="absolute z-10 top-3 left-3">
          <MagnifyingGlassIcon className="text-secondary w-4 h-4" />
        </div>

        <TextInputWithTooltip
          value={localValue}
          onChange={handleChange}
          placeholder="Search delegates or enter address"
          tooltipMessage="Search by statement text or enter exact NEAR address"
          className="py-2 pr-8 pl-8 rounded-full bg-wash border border-line w-full sm:w-auto placeholder-tertiary/50 text-secondary"
        />

        {(localValue || searchQuery) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute z-10 top-1/2 -translate-y-1/2 right-3 text-tertiary hover:text-secondary"
            aria-label="Clear search"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
}
