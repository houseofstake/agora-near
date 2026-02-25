import { TokenMetadata } from "@/lib/types";
import { Popover, Transition } from "@headlessui/react";
import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { memo, useMemo } from "react";
import { createPortal } from "react-dom";
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

type MobileAssetRowProps = {
  metadata?: TokenMetadata | null;
  columns: {
    title: React.ReactNode;
    subtitle: React.ReactNode;
  }[];
  overflowButtons?: OverflowButton[];
  actionButton?: ActionButton;
  actionButtons?: ActionButton[];
};

const variants = {
  hidden: { y: "100%" },
  show: { y: "0%" },
  exit: { y: "100%" },
};

export const MobileAssetRow = memo(
  ({
    metadata,
    columns,
    overflowButtons,
    actionButton,
    actionButtons,
  }: MobileAssetRowProps) => {
    const buttonsToRender = useMemo(() => {
      if (actionButtons && actionButtons.length > 0) {
        return actionButtons;
      }
      if (actionButton) {
        return [actionButton];
      }
      return [];
    }, [actionButton, actionButtons]);

    const hasActionButtons = useMemo(() => {
      return (
        buttonsToRender.length > 0 ||
        (!!overflowButtons && overflowButtons.length > 0)
      );
    }, [buttonsToRender, overflowButtons]);

    return (
      <Popover className="relative">
        {({ open }) => (
          <>
            <Popover.Button
              onClick={(e) => {
                if (!hasActionButtons) {
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
              className={`w-full bg-neutral border border-line rounded-xl p-4 mb-3 outline-none hover:bg-wash transition-colors text-left`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="mb-4">
                    <span className="font-medium text-primary text-lg">
                      {metadata?.name}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {columns.map((col, index) => (
                      <div key={index} className="flex flex-col">
                        <span className="text-sm text-secondary">
                          {col.title}
                        </span>
                        <span className="font-medium text-primary">
                          {col.subtitle}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {hasActionButtons ? (
                  <div className="flex items-center ml-4">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                      <ArrowRightIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ) : null}
              </div>
            </Popover.Button>

            {open && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  exit={{ opacity: 0 }}
                  className="z-[60] bg-black fixed top-0 left-0 right-0 bottom-0"
                />
              </AnimatePresence>
            )}

            <Transition className="absolute z-[70]">
              <Popover.Panel>
                {({ close }) =>
                  createPortal(
                    <motion.div
                      className="bg-neutral py-8 px-6 rounded-t-lg w-full fixed z-[70] bottom-0 left-0 border-t border-line"
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      variants={variants}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex flex-col gap-4 min-h-[150px]">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-line">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={metadata?.icon ?? ""}
                              alt={metadata?.name ?? ""}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-medium text-primary text-lg">
                            {metadata?.name}
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 grow justify-end">
                          {buttonsToRender.map((button, index) => {
                            const buttonElement = (
                              <UpdatedButton
                                key={index}
                                className="w-full"
                                variant="rounded"
                                onClick={() => {
                                  button.onClick();
                                  close();
                                }}
                                type={button.disabled ? "disabled" : "primary"}
                                disabled={button.disabled}
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
                                <TooltipWithTap
                                  key={index}
                                  content={button.tooltip}
                                >
                                  {buttonElement}
                                </TooltipWithTap>
                              );
                            }

                            return buttonElement;
                          })}
                          {overflowButtons?.map((button, index) => (
                            <button
                              key={index}
                              className="w-full flex items-center justify-center gap-2 font-bold text-md"
                              onClick={() => {
                                button.onClick();
                                close();
                              }}
                            >
                              <span>{button.title}</span>
                              {button.showExternalIcon && (
                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>,
                    document.body
                  )
                }
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    );
  }
);

MobileAssetRow.displayName = "MobileAssetRow";
