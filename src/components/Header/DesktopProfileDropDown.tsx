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
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  accountId?: string;
  signOut: () => void;
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

export const DesktopProfileDropDown = ({ accountId, signOut }: Props) => {
  const { ui } = Tenant.current();

  // Don't hydrate the component until the user clicks on the profile dropdown
  const [shouldHydrate, setShouldHydrate] = useState(false);

  const { data: tokenBalance, isFetching: isFetchingTokenBalance } =
    useTokenBalance(shouldHydrate ? accountId : undefined);

  const { data: votingPower = "0", isLoading: isLoadingVotingPower } =
    useVotingPower(shouldHydrate ? accountId : undefined);

  const { data: accountInfo } = useVenearAccountInfo(
    shouldHydrate ? accountId : undefined
  );
  const [filterParam] = useQueryState("filter");

  const isDelegationEncouragementEnabled = ui.toggle(
    "delegation-encouragement-wallet"
  )?.enabled;

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
              className="flex outline-none"
              onClick={() => setShouldHydrate(true)}
            >
              <div className="text-primary flex items-center gap-3">
                <NearAvatar accountId={accountId} size={28} />
                <div className="hidden lg:inline">
                  {accountId && (
                    <span className="truncate max-w-[140px] block">
                      {accountId}
                    </span>
                  )}
                </div>
              </div>
            </Popover.Button>

            {open && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  exit={{ opacity: 0 }}
                  className="z-[60] bg-black fixed top-0 bottom-0 right-0 left-0"
                />
              </AnimatePresence>
            )}

            <Transition
              className="absolute right-0 z-[100]"
              enter="transition duration-00 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Popover.Panel>
                {({ close }) => (
                  <div className="bg-wash border border-line rounded-[16px] w-[376px] shadow-newPopover">
                    <div className="flex flex-col min-h-[250px]">
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

                      <div className="p-6 py-[30px] border-t border-line bg-wash sm:rounded-bl-[16px] sm:rounded-br-[16px]">
                        <div className="flex items-center justify-between">
                          <div
                            onClick={signOut}
                            className="cursor-pointer flex font-bold"
                          >
                            <Logout
                              fill={rgbStringToHex(ui?.customization?.primary)}
                              className={"mr-[10px] self-center"}
                            />
                            <span className="text-primary">Logout</span>
                          </div>
                          <ThemeToggle />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
