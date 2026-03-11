import Big from "big.js";
import { NANO_SECONDS_IN_YEAR } from "./constants";
import { format } from "date-fns";
import { NEAR_NOMINATION_EXP } from "@near-js/utils";

export const getAPYFromGrowthRate = (growthRateNs: Big) => {
  try {
    const annualRatePercent = growthRateNs.mul(NANO_SECONDS_IN_YEAR).mul(100);
    return annualRatePercent.toFixed(0);
  } catch (error) {
    return "0";
  }
};

export const getVotingPowerBoost = (
  numMonths: number,
  growthRateNs: string | Big
): Big => {
  if (numMonths <= 0) return Big(1);
  const annualRateDecimal = Big(growthRateNs).mul(NANO_SECONDS_IN_YEAR);
  const periodFraction = Big(numMonths).div(12);
  return Big(1).add(annualRateDecimal.mul(periodFraction));
};

export const getEstimatedVeNearBalance = (
  principalAmount: string,
  numMonths: number,
  growthRateNs: string | Big
) => {
  if (numMonths <= 0 || !principalAmount || principalAmount === "0") {
    return principalAmount;
  }

  try {
    const nearAmount = Big(principalAmount);
    const boost = getVotingPowerBoost(numMonths, growthRateNs);
    const estimatedVeNearBalance = nearAmount.mul(boost);
    return estimatedVeNearBalance.toFixed(NEAR_NOMINATION_EXP);
  } catch (error) {
    return "0";
  }
};

export const getFormattedUnlockDuration = (
  unlockDurationNs: string | bigint
): string => {
  const ms = Number(unlockDurationNs) / 1e6;
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  return `${days} day${days === 1 ? "" : "s"}`;
};

export const getIsEligibleToUnlock = (unlockTimestampNs: string) => {
  const unlockTimestampMs = Big(unlockTimestampNs).div(1000000);
  const currentTimestampMs = Big(Date.now());
  return currentTimestampMs.gte(unlockTimestampMs);
};

export const getFormattedUnlockTimestamp = (unlockTimestampNs: string) => {
  const unlockTimestampMs = Big(unlockTimestampNs).div(1000000).toNumber();
  const date = new Date(unlockTimestampMs);

  return format(date, "yyyy-MM-dd h:mm aaa");
};
