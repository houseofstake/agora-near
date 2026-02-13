import { useState, useEffect, useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import Tenant from "@/lib/tenant/tenant";
import { useDelegatesFilter } from "./useDelegatesFilter";
import { useAnalytics } from "@/hooks/useAnalytics";

const CountBadge = ({ count }: { count: number }) => (
  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-primary bg-wash border border-line rounded-full">
    {count}
  </span>
);

const IssueFilterCheckBoxItem = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <Checkbox checked={checked} onCheckedChange={onChange} />
    <span className="text-sm font-medium text-primary">{label}</span>
  </label>
);

const DelegatesIssuesFilter = ({
  startTransition,
}: {
  startTransition?: (callback: () => void) => void;
}) => {
  const { ui } = Tenant.current();
  const { issuesParam, handleIssuesChange } = useDelegatesFilter({
    startTransition: startTransition || (() => {}),
  });

  const { trackDelegateFilterApplied } = useAnalytics();

  const issuesFromUrl = useMemo(() => {
    return issuesParam ? issuesParam.split(",").filter(Boolean) : [];
  }, [issuesParam]);

  const initialIssueCategories: Record<string, boolean> = useMemo(() => {
    const categories: Record<string, boolean> = {
      all: issuesFromUrl.length === 0,
    };

    ui.governanceIssues?.forEach((issue) => {
      categories[issue.key] = issuesFromUrl.includes(issue.key);
    });

    return categories;
  }, [issuesFromUrl, ui.governanceIssues]);

  const [allIssuesChecked, setAllIssuesChecked] = useState(
    issuesFromUrl.length === 0
  );
  const [issueCategories, setIssueCategories] = useState(
    initialIssueCategories
  );

  useEffect(() => {
    const newIssueCategories: Record<string, boolean> = {
      all: issuesFromUrl.length === 0,
    };

    ui.governanceIssues?.forEach((issue) => {
      newIssueCategories[issue.key] = issuesFromUrl.includes(issue.key);
    });

    setIssueCategories(newIssueCategories);
    setAllIssuesChecked(issuesFromUrl.length === 0);
  }, [issuesFromUrl, ui.governanceIssues]);

  const toggleAllIssues = () => {
    const newValue = !allIssuesChecked;
    setAllIssuesChecked(newValue);

    if (newValue) {
      // If "All issues" is checked, clear all issues
      handleIssuesChange([]);

      const resetIssues: Record<string, boolean> = { all: true };
      ui.governanceIssues?.forEach((issue) => {
        resetIssues[issue.key] = false;
      });
      setIssueCategories(resetIssues);
    }
  };

  const handleIssueCategoryChange = (category: string) => {
    const newIssueCategories = {
      ...issueCategories,
      [category]: !issueCategories[category],
    };
    setIssueCategories(newIssueCategories);
    setAllIssuesChecked(false);

    const selectedIssues = Object.entries(newIssueCategories)
      .filter(([key, value]) => key !== "all" && value)
      .map(([key]) => key);

    handleIssuesChange(selectedIssues);
    trackDelegateFilterApplied({
      filter_type: "issues",
      filter_value: selectedIssues.join(","),
    });
  };

  const selectedIssueCategoriesCount = Object.entries(issueCategories).reduce(
    (count, [key, value]) => {
      return key !== "all" && value ? count + 1 : count;
    },
    0
  );

  if (!ui.governanceIssues || ui.governanceIssues.length === 0) {
    return null;
  }

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="issues" className="border-none">
        <AccordionTrigger className="hover:no-underline py-0 px-0">
          <div className="flex items-center gap-2 text-secondary text-base font-semibold">
            Issue Categories
            {selectedIssueCategoriesCount > 0 && (
              <CountBadge count={selectedIssueCategoriesCount} />
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-0">
          <div className="flex flex-col gap-4 pt-4">
            <IssueFilterCheckBoxItem
              label="All issues"
              checked={allIssuesChecked}
              onChange={toggleAllIssues}
            />
            {ui.governanceIssues.map((issue) => (
              <IssueFilterCheckBoxItem
                key={issue.key}
                label={issue.title}
                checked={issueCategories[issue.key]}
                onChange={() => handleIssueCategoryChange(issue.key)}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default DelegatesIssuesFilter;
