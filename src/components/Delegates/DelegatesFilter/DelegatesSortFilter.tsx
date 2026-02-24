"use client";

import { useState } from "react";
import { delegatesSortOptions } from "@/lib/constants";
import FilterResetListbox from "@/components/common/FilterResetListbox";
import { SortIcon } from "@/assets/Sort";
import Tenant from "@/lib/tenant/tenant";
import { rgbStringToHex } from "@/lib/color";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useDelegatesSort } from "@/components/Delegates/DelegatesFilter/useDelegatesSort";
import { DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/hooks/useAnalytics";

export type SortOptionProps = {
  label: string;
  value: string;
  checked: boolean;
};

export const SortOption = ({ label, value, checked }: SortOptionProps) => (
  <DropdownMenuRadioItem
    value={value}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-lg p-3 text-base outline-none transition-colors hover:bg-neutral/50",
      checked ? "text-primary" : "text-secondary"
    )}
  >
    {label}
  </DropdownMenuRadioItem>
);

export default function DelegatesSortFilter({
  startTransitionSort,
}: {
  startTransitionSort: (callback: () => void) => void;
}) {
  const { ui } = Tenant.current();
  const [isOpen, setIsOpen] = useState(false);
  const { trackDelegateSortChanged } = useAnalytics();

  // Use shared sort hook
  const { orderByParam, handleSortChange, resetSort } = useDelegatesSort({
    startTransition: startTransitionSort,
  });

  return (
    <FilterResetListbox
      triggerLabel="Sort by"
      triggerIcon={
        <div className="flex items-center gap-4">
          <SortIcon fill={rgbStringToHex(ui?.customization?.primary)} />
        </div>
      }
      activeCount={0}
      onReset={resetSort}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <div className="self-stretch p-3 flex flex-col gap-2">
        <DropdownMenu.RadioGroup
          value={orderByParam}
          onValueChange={(value) => {
            handleSortChange(value);
            trackDelegateSortChanged({ sort_option: value });
          }}
        >
          {Object.keys(delegatesSortOptions).map((key) => (
            <SortOption
              key={key}
              label={
                delegatesSortOptions[key as keyof typeof delegatesSortOptions]
                  .value
              }
              value={
                delegatesSortOptions[key as keyof typeof delegatesSortOptions]
                  .sort
              }
              checked={
                delegatesSortOptions[key as keyof typeof delegatesSortOptions]
                  .sort === orderByParam
              }
            />
          ))}
        </DropdownMenu.RadioGroup>
      </div>
    </FilterResetListbox>
  );
}
