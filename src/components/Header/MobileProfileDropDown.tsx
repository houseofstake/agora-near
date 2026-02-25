"use client";

import { rgbStringToHex } from "@/lib/color";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useVotingPower } from "@/hooks/useVotingPower";
import { useVenearAccountInfo } from "@/hooks/useVenearAccountInfo";
import { Logout } from "@/assets/logout";

import Tenant from "@/lib/tenant/tenant";
import { Popover, Transition } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";

import { ReactNode, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { AccountActions } from "../AccountActions/AccountActionsButton";
import { PanelRow } from "../Delegates/DelegateProfile/DelegateProfile";
import TokenAmount from "../shared/TokenAmount";
import { UpdatedButton } from "../Button";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useQueryState } from "nuqs";
import Big from "big.js";
import Link from "next/link";
import CopyableHumanAddress from "../shared/CopyableHumanAddress";

import NearAvatar from "../shared/NearAvatar";
import EncourageDelegationDot from "./EncourageDelegationDot";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  accountId: string | undefined;
  signOut: () => void;
};

// Add your variants
const variants = {
  hidden: { y: "100%" },
  show: { y: "0%" },
  exit: { y: "100%" },
};

const RenderEncourageDelegation = () => {
  return (
    <div className="p-4 rounded-lg border border-negative gap-2 bg-neutral">
      <div className="flex flex-col text-primary leading-normal">
        <div className="inline-flex gap-2">
          <ExclamationCircleIcon className="w-6 h-6 stroke-negative" />
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-4">
            <div className="flex flex-col justify-start items-start gap-1">
              <div className="text-base font-bold">
                Vote through endorsed delegates!
              </div>
              <div className="text-sm font-medium leading-[21px]">
                Make your vote count by delegating to trusted community members.
              </div>
            </div>
          </div>
        </div>
        <Link href="/delegates?filter=endorsed">
          <UpdatedButton
            type="primary"
            className="outline outline-1 gap-2 justify-center mt-6 font-bold bg-primary text-neutral w-full"
          >
            View endorsed delegates
          </UpdatedButton>
        </Link>
      </div>
    </div>
  );
};

export const MobileProfileDropDown = ({ accountId, signOut }: Props) => {
  const { ui } = Tenant.current();
  const isDelegationEncouragementEnabled = ui.toggle(
    "delegation-encouragement-wallet"
  )?.enabled;
  // Don't hydrate the component until the user clicks on the profile dropdown
  const [shouldHydrate, setShouldHydrate] = useState(false);

  const { data: tokenBalance, isFetching: isFetchingTokenBalance } =
    useTokenBalance(shouldHydrate ? accountId : undefined);

  const { data: votingPower, isLoading: isLoadingVotingPower } = useVotingPower(
    shouldHydrate ? accountId : undefined
  );

  const { data: accountInfo } = useVenearAccountInfo(
    shouldHydrate ? accountId : undefined
  );
  const [filterParam] = useQueryState("filter");

  const shouldShowEncourageBanner = useMemo(() => {
    if (!accountInfo || !accountId || !shouldHydrate) return false;

    // Don't show banner if already viewing endorsed delegates
    if (filterParam === "endorsed") return false;

    // Check if user has any tokens (total balance > 0)
    const totalBalance = Big(accountInfo.totalBalance.near || "0").plus(
      accountInfo.totalBalance.extraBalance || "0"
    );

    // Check if user has delegated
    const delegatee = accountInfo.delegation?.delegatee;
    const hasDelegated = !!delegatee;
    const isDelegatedToSelf = delegatee === accountId;

    // Show banner if user has tokens and (hasn't delegated OR is delegated to themselves)
    return totalBalance.gt(0) && (!hasDelegated || isDelegatedToSelf);
  }, [accountInfo, accountId, shouldHydrate, filterParam]);

  return (
    <Popover className="relative cursor-auto">
      {({ open }) => {
        return (
          <>
            <Popover.Button
              className="mt-1 outline-none"
              onClick={() => setShouldHydrate(true)}
            >
              {isDelegationEncouragementEnabled && (
                <EncourageDelegationDot className="right-[-3px]" />
              )}
              <NearAvatar accountId={accountId} size={24} />
            </Popover.Button>

            {open && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  exit={{ opacity: 0 }}
                  className={
                    "z-[60] bg-black fixed top-0 left-0 right-0 bottom-0"
                  }
                />
              </AnimatePresence>
            )}

            <Transition className="absolute z-[70]">
              <Popover.Panel>
                {({ close }) =>
                  createPortal(
                    <motion.div
                      className="bg-wash rounded-t-2xl w-full fixed z-[70] bottom-0 left-0"
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      variants={variants}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex flex-col min-h-[280px]">
                        <div className="flex flex-col px-6 py-5 border-b border-line">
                          <div className="flex flex-row items-center gap-2 text-primary">
                            <NearAvatar accountId={accountId} size={40} />
                            <div className="flex flex-col flex-1">
                              <span className="text-primary font-bold">
                                {accountId && (
                                  <CopyableHumanAddress
                                    address={accountId}
                                    shouldTruncate={true}
                                  />
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="self-stretch flex flex-col font-medium bg-neutral">
                          <div className="py-4 px-6 flex gap-4 flex-col">
                            <PanelRow
                              title={
                                ui.tacticalStrings?.myBalance ||
                                "My token balance"
                              }
                              detail={
                                <RowSkeletonWrapper
                                  isLoading={isFetchingTokenBalance}
                                >
                                  <TokenAmount
                                    amount={tokenBalance || BigInt(0)}
                                  />
                                </RowSkeletonWrapper>
                              }
                            />
                            <PanelRow
                              title="My voting power"
                              detail={
                                <RowSkeletonWrapper
                                  isLoading={isLoadingVotingPower}
                                >
                                  <TokenAmount
                                    amount={votingPower || BigInt(0)}
                                    currency="veNEAR"
                                  />
                                </RowSkeletonWrapper>
                              }
                            />
                            {shouldShowEncourageBanner &&
                              isDelegationEncouragementEnabled && (
                                <RenderEncourageDelegation />
                              )}
                          </div>

                          <div className="flex flex-col p-6 font-medium">
                            <AccountActions close={close} />
                          </div>
                        </div>

                        <div className="p-6 py-[30px] border-t border-line bg-wash rounded-bl-[16px] rounded-br-[16px]">
                          <div className="flex items-center justify-between">
                            <div
                              onClick={signOut}
                              className="cursor-pointer flex font-bold"
                            >
                              <Logout
                                fill={rgbStringToHex(
                                  ui?.customization?.primary
                                )}
                                className={"mr-[10px] self-center"}
                              />
                              <span className="text-primary">Logout</span>
                            </div>
                            <ThemeToggle />
                          </div>
                        </div>
                      </div>
                    </motion.div>,
                    document.body
                  )
                }
              </Popover.Panel>
            </Transition>
          </>
        );
      }}
    </Popover>
  );
};

const RowSkeletonWrapper = ({
  children,
  isLoading,
}: {
  children: ReactNode;
  isLoading: boolean;
}) =>
  isLoading ? (
    <div className="animate-pulse bg-tertiary/10 h-5 w-[90px] rounded-2xl"></div>
  ) : (
    <div className="text-primary">{children}</div>
  );
