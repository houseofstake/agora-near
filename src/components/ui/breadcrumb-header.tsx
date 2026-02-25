import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export interface BreadcrumbHeaderProps {
  steps: string[];
  currentStepIndex: number;
  className?: string;
}

const BreadcrumbHeader = React.memo<BreadcrumbHeaderProps>(
  ({ steps, currentStepIndex, className }) => {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        {steps.map((step, index) => (
          <React.Fragment key={`${step}-${index}`}>
            <span
              className={cn(
                "text-md transition-colors",
                index === currentStepIndex
                  ? "font-bold text-primary"
                  : "font-normal text-tertiary"
              )}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <ArrowRightIcon className="w-5 h-5 text-primary" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }
);

BreadcrumbHeader.displayName = "BreadcrumbHeader";

export { BreadcrumbHeader };
