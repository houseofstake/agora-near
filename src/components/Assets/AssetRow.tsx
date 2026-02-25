import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TokenMetadata } from "@/lib/types";
import {
  ArrowTopRightOnSquareIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import React, { memo, useMemo } from "react";
import { UpdatedButton } from "../Button";
import LoadingSpinner from "../shared/LoadingSpinner";
import { TooltipWithTap } from "../ui/tooltip-with-tap";

type OverflowButton = {
  title: string;
  onClick: () => void;
  showExternalIcon?: boolean;
};

type ActionButton = {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  tooltip?: string;
};

type AssetRowProps = {
  metadata?: TokenMetadata | null;
  columns: {
    title: React.ReactNode;
    subtitle: React.ReactNode;
  }[];
  showOverflowMenu: boolean;
  overflowButtons?: OverflowButton[];
  actionButton?: ActionButton;
  actionButtons?: ActionButton[];
  className?: string;
  icon?: React.ReactNode;
};

const MAX_COLUMNS = 4;

export const AssetRow = memo(
  ({
    metadata,
    columns,
    showOverflowMenu,
    overflowButtons,
    actionButton,
    actionButtons,
    className,
    icon,
  }: AssetRowProps) => {
    const numColPlaceholders = MAX_COLUMNS - columns.length - 1;

    if (numColPlaceholders < 0) {
      throw new Error("Columns length is greater than maximum columns");
    }

    const columnPlaceholders = Array.from(
      { length: numColPlaceholders },
      (_, index) => (
        <td key={index} className="py-4 pl-2 pr-4">
          <></>
        </td>
      )
    );

    const buttonsToRender = useMemo(() => {
      if (actionButtons && actionButtons.length > 0) {
        return actionButtons;
      }
      if (actionButton) {
        return [actionButton];
      }
      return [];
    }, [actionButton, actionButtons]);

    const actionButtonContent = useMemo(() => {
      if (buttonsToRender.length === 0) return null;

      return (
        <div className="flex gap-2">
          {buttonsToRender.map((button, index) => {
            const buttonElement = (
              <UpdatedButton
                key={index}
                className="w-full"
                variant="rounded"
                onClick={button.disabled ? undefined : button.onClick}
                type={button.disabled ? "disabled" : undefined}
              >
                {button.isLoading ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                ) : (
                  button.title
                )}
              </UpdatedButton>
            );

            if (button.tooltip && button.disabled) {
              return (
                <TooltipWithTap key={index} content={button.tooltip}>
                  {buttonElement}
                </TooltipWithTap>
              );
            }

            return buttonElement;
          })}
        </div>
      );
    }, [buttonsToRender]);

    return (
      <tr className={`border-b border-line last:border-b-0 ${className || ""}`}>
        <td className="py-4 pr-16 w-1 whitespace-nowrap min-w-0 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              {icon ? (
                icon
              ) : (
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={metadata?.icon ?? ""}
                    alt={metadata?.name ?? ""}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {metadata?.isCustomPool && (
                <TooltipWithTap content="Non-liquid Staking Pool">
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black rounded-full border-2 border-white flex items-center justify-center cursor-pointer">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </TooltipWithTap>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-primary break-words">
                {metadata?.name}
              </span>
            </div>
          </div>
        </td>
        {columns.map((col, index) => (
          <td key={index} className="py-4 px-2 w-[200px]">
            <div className="flex flex-col">
              <span className="text-sm text-secondary mb-1">{col.title}</span>
              <span className="font-medium text-primary">{col.subtitle}</span>
            </div>
          </td>
        ))}
        {/* Placeholders to fill gaps for rows that don't need all the columns */}
        {columnPlaceholders}
        <td className="py-4 pl-4 w-1 whitespace-nowrap">
          <div className="flex items-center justify-end gap-2">
            <div
              className={buttonsToRender.length > 1 ? "min-w-[320px]" : "w-40"}
            >
              {actionButtonContent}
            </div>
            <div className="w-9 h-9 flex items-center justify-center">
              {showOverflowMenu &&
                overflowButtons &&
                overflowButtons.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="p-2 text-tertiary hover:text-secondary transition-colors outline-none">
                      <EllipsisHorizontalIcon className="w-5 h-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {overflowButtons.map((button, index) => (
                        <DropdownMenuItem
                          key={index}
                          className="cursor-pointer flex items-center justify-between"
                          onClick={button.onClick}
                        >
                          <span>{button.title}</span>
                          {button.showExternalIcon && (
                            <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2 text-tertiary" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
            </div>
          </div>
        </td>
      </tr>
    );
  }
);

AssetRow.displayName = "AssetRow";
