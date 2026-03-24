"use client";

import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";

type InfoSearchProps = {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export const InfoSearch = ({
  placeholder = "Search…",
  value,
  onChange,
}: InfoSearchProps) => {
  const [internalValue, setInternalValue] = useState("");
  const inputValue = value ?? internalValue;

  const handleChange = (next: string) => {
    if (onChange) {
      onChange(next);
    } else {
      setInternalValue(next);
    }
  };

  return (
    <div className="flex w-full">
      <div className="relative flex w-full items-center sm:w-[160px]">
        <div className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2">
          <MagnifyingGlassIcon className="h-3 w-3 text-tertiary" />
        </div>
        <input
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-line bg-neutral py-1 pl-7 pr-3 text-sm sm:text-xs text-secondary placeholder-tertiary outline-none focus:outline-none focus:ring-0 focus:border-primary"
        />
      </div>
    </div>
  );
};

