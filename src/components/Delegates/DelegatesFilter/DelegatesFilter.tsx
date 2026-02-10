import { useState } from "react";
import { cn } from "@/lib/utils";
import FilterResetListbox from "@/components/common/FilterResetListbox";
import { delegatesFilterOptions } from "@/lib/constants";
import { useDelegatesFilter } from "./useDelegatesFilter";
import { CheckmarkIcon } from "react-hot-toast";
import { FilterIcon } from "@/assets/filter";
import DelegatesIssuesFilter from "./DelegatesIssuesFilter";
import { useQueryState } from "nuqs";
import { useAnalytics } from "@/hooks/useAnalytics";

type FilterButtonProps = {
  label: string;
  isActive?: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
};

export const FilterButton = ({
  label,
  isActive = false,
  icon,
  onClick,
}: FilterButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      "h-10 px-4 py-1.5 rounded-full flex justify-center items-center gap-1",
      isActive
        ? "bg-brandPrimary text-neutral"
        : "bg-neutral text-primary border border-secondary"
    )}
  >
    {icon}
    <span className="text-base font-medium leading-normal">{label}</span>
  </button>
);

export const DelegatesFilter = ({
  startTransitionFilter,
}: {
  startTransitionFilter: (callback: () => void) => void;
}) => {
  // Filter state
  const [isOpen, setIsOpen] = useState(false);
  const { filterParam, handleFilterChange, resetFilter } = useDelegatesFilter({
    startTransition: startTransitionFilter,
  });

  // Get issues parameter for active count
  const [issuesParam] = useQueryState("issues", {
    defaultValue: "",
    clearOnDefault: true,
  });

  const onFilterClose = (status: boolean) => {
    setIsOpen(status);
  };

  // Calculate active filters count
  const hasActiveFilter = filterParam !== delegatesFilterOptions.all.filter;
  const hasActiveIssues = issuesParam && issuesParam.length > 0;
  const activeCount = (hasActiveFilter ? 1 : 0) + (hasActiveIssues ? 1 : 0);

  const { trackDelegateFilterApplied } = useAnalytics();

  const handleFilterClick = (filterValue: string, filterType: string) => {
    handleFilterChange(filterValue);
    trackDelegateFilterApplied({
      filter_type: filterType,
      filter_value: filterValue,
    });
  };

  return (
    <FilterResetListbox
      triggerLabel="Filter"
      triggerIcon={
        <FilterIcon
          className={
            activeCount > 0
              ? "stroke-primary sm:stroke-neutral"
              : "stroke-primary"
          }
        />
      }
      activeCount={activeCount}
      onReset={resetFilter}
      isOpen={isOpen}
      onOpenChange={onFilterClose}
    >
      <div className="self-stretch px-2.5 py-6 bg-wash flex flex-col justify-start items-start">
        <div className="self-stretch inline-flex justify-start items-start gap-2.5 flex-wrap content-start">
          <FilterButton
            label={delegatesFilterOptions.all.value}
            isActive={filterParam === delegatesFilterOptions.all.filter}
            onClick={() =>
              handleFilterClick(delegatesFilterOptions.all.filter, "status")
            }
          />
          <FilterButton
            label={delegatesFilterOptions.endorsed.value}
            isActive={filterParam === delegatesFilterOptions.endorsed.filter}
            onClick={() =>
              handleFilterClick(
                delegatesFilterOptions.endorsed.filter,
                "status"
              )
            }
            icon={
              <CheckmarkIcon
                className={
                  filterParam === delegatesFilterOptions.endorsed.filter
                    ? "fill-brandPrimary stroke-neutral"
                    : "fill-primary stroke-neutral"
                }
              />
            }
          />
        </div>
      </div>
      <div className="border-t border-line px-2.5 py-6">
        <DelegatesIssuesFilter startTransition={startTransitionFilter} />
      </div>
    </FilterResetListbox>
  );
};
