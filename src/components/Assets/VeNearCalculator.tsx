"use client";

import { useCallback, useMemo, useState } from "react";
import { useVenearSnapshot } from "@/hooks/useVenearSnapshot";
import {
  getAPYFromGrowthRate,
  getEstimatedVeNearBalance,
  getVotingPowerBoost,
} from "@/lib/lockUtils";
import { Input } from "@/components/ui/input";
import TokenAmount from "../shared/TokenAmount";
import { parseNearAmount } from "@near-js/utils";
import Big from "big.js";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

const DURATION_OPTIONS = [
  { months: 3, label: "3m" },
  { months: 12, label: "1y" },
  { months: 24, label: "2y" },
  { months: 48, label: "4y" },
];

function formatDurationLabel(months: number): string {
  if (months < 12) return `${months}m`;
  const years = months / 12;
  return years === 1 ? "1y" : `${years}y`;
}

export function VeNearCalculator({
  defaultAmount,
}: {
  defaultAmount?: string;
}) {
  const [amount, setAmount] = useState(defaultAmount ?? "1000");
  const [durationMonths, setDurationMonths] = useState(12);

  const { growthRateNs, isLoading: isLoadingSnapshot } = useVenearSnapshot();

  const lockApy = useMemo(
    () => getAPYFromGrowthRate(growthRateNs),
    [growthRateNs]
  );

  const apyDecimal = useMemo(() => (parseFloat(lockApy) || 0) / 100, [lockApy]);

  const votingPowerBoost = useMemo(
    () => getVotingPowerBoost(durationMonths, growthRateNs),
    [durationMonths, growthRateNs]
  );

  const principalYocto = useMemo(() => {
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return "0";
    return parseNearAmount(amount) ?? "0";
  }, [amount]);

  const votingPowerAtEnd = useMemo(() => {
    if (Big(principalYocto).lte(0)) return "0";
    return getEstimatedVeNearBalance(
      principalYocto,
      durationMonths,
      growthRateNs
    );
  }, [principalYocto, durationMonths, growthRateNs]);

  const estimatedRewardsYocto = useMemo(() => {
    if (Big(principalYocto).lte(0)) return "0";
    const years = Big(durationMonths).div(12);
    const rewards = Big(principalYocto).mul(apyDecimal).mul(years);
    return rewards.toFixed(0);
  }, [principalYocto, durationMonths, apyDecimal]);

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (v === "" || /^\d*\.?\d*$/.test(v)) setAmount(v);
    },
    []
  );

  const isLoading = isLoadingSnapshot;
  const hasValidInput = parseFloat(amount) > 0;
  const durationLabel = formatDurationLabel(durationMonths);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-2xl font-extrabold text-black">
          veNEAR Calculator
        </h3>
        <p className="text-base text-gray-600 mt-1">
          Estimate your voting power and rewards
        </p>
      </div>

      <div
        className={
          "rounded-xl overflow-hidden flex flex-col sm:flex-row border border-gray-200"
        }
      >
        <div className="bg-[#17171A] p-4 sm:p-6 flex flex-col justify-between min-h-[200px]">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-gray-200 mb-2">Reward Rate</p>
              <p className="text-3xl sm:text-4xl font-bold text-[#00E391] mb-1">
                {lockApy}%
              </p>
              <p className="text-sm text-gray-300">annual APY</p>
            </div>
            <div className="border-t border-gray-900" />
            <div>
              <p className="text-sm text-gray-200 mb-2">Voting Power Boost</p>
              <p className="text-3xl sm:text-4xl font-bold text-[#00E391] mb-1">
                {votingPowerBoost.toFixed(2)}x
              </p>
              <p className="text-sm text-gray-300">at selected duration</p>
            </div>
          </div>
          <Link
            href="/info#ve-near-rewards"
            className="flex items-center gap-1 text-sm text-gray-300 hover:text-gray-300 mt-4"
          >
            Learn more about the methodology
            <ChevronRightIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex-1 bg-white p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-600">
              Lock Amount
            </label>
            <div className="flex items-baseline gap-2 border-b border-gray-200 py-2">
              <span className="text-gray-600 font-semibold">NEAR</span>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={handleAmountChange}
                className="flex-1 border-0 bg-transparent p-0 text-2xl font-semibold text-gray-900 focus-visible:ring-0 focus-visible:ring-offset-0 min-w-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-600">
              Lock Duration
            </label>
            <div className="relative pt-2 pb-1">
              <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200" />
              <div className="relative flex justify-between">
                {DURATION_OPTIONS.map(({ months, label }) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setDurationMonths(months)}
                    className="flex flex-col items-center gap-2"
                  >
                    <span
                      className={cn(
                        "relative z-10 w-2 h-2 rounded-full transition-colors",
                        durationMonths === months
                          ? "bg-gray-900"
                          : "bg-gray-200"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm transition-colors",
                        durationMonths === months
                          ? "font-bold text-gray-900"
                          : "font-normal text-gray-500"
                      )}
                    >
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="h-28 flex items-center justify-center text-gray-500">
              Loading...
            </div>
          ) : (
            hasValidInput && (
              <div className="bg-gray-50 border border-gray-300 rounded-xl p-5 flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-1 sm:border-r sm:border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">
                    veNEAR & rewards after {durationLabel}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    <TokenAmount
                      amount={votingPowerAtEnd}
                      hideCurrency
                      minimumFractionDigits={0}
                      maximumSignificantDigits={6}
                    />{" "}
                    <span className="text-gray-600 font-semibold text-base">
                      veNEAR
                    </span>
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Est. rewards</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    <TokenAmount
                      amount={estimatedRewardsYocto}
                      hideCurrency
                      minimumFractionDigits={2}
                      maximumSignificantDigits={4}
                    />{" "}
                    <span className="text-gray-600 font-semibold text-base">
                      NEAR
                    </span>
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
      <p className="text-xs text-gray-600">
        Estimates are illustrative only. Actual veNEAR and rewards may vary
        based on network conditions and protocol changes. Not financial advice.
      </p>
    </div>
  );
}
