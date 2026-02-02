import Big from "big.js";

import { LOCKUP_MIN_STORAGE_DEPOSIT } from "./constants";
import { NEAR_NOMINATION } from "@near-js/utils";

export const filterDust = ({
  amount,
  dustThreshold = 0.001,
}: {
  amount: string;
  dustThreshold?: number;
}) =>
  Big(amount).div(NEAR_NOMINATION.toString()).gte(dustThreshold) ? amount : "0";

export const removeDeposit = ({
  amount,
  depositAmount = LOCKUP_MIN_STORAGE_DEPOSIT,
}: {
  amount: string;
  depositAmount?: number;
}) => {
  const lockableBalance = Big(amount).minus(
    Big(depositAmount).times(NEAR_NOMINATION.toString())
  );
  return lockableBalance.gte(0) ? lockableBalance.toString() : "0";
};
