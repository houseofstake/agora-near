import { describe, it, expect } from "vitest";
import { removeDeposit } from "../tokenUtils";
import { LOCKUP_MIN_STORAGE_DEPOSIT } from "../constants";

import Big from "big.js";
import { NEAR_NOMINATION } from "@near-js/utils";

describe("removeDeposit", () => {
  it("should remove the default deposit amount from the balance", () => {
    const amount = new Big(1).times(NEAR_NOMINATION.toString()).toString();
    const expected = new Big(amount)
      .minus(
        new Big(LOCKUP_MIN_STORAGE_DEPOSIT).times(NEAR_NOMINATION.toString())
      )
      .toString();
    const result = removeDeposit({ amount });
    expect(result).toBe(expected);
  });

  it("should return 0 if the balance is less than the deposit amount", () => {
    const amount = new Big(0.1).times(NEAR_NOMINATION.toString()).toString();
    const result = removeDeposit({ amount });
    expect(result).toBe("0");
  });

  it("should use a custom deposit amount if provided", () => {
    const amount = new Big(1).times(NEAR_NOMINATION.toString()).toString();
    const depositAmount = 0.5;
    const expected = new Big(amount)
      .minus(new Big(depositAmount).times(NEAR_NOMINATION.toString()))
      .toString();
    const result = removeDeposit({ amount, depositAmount });
    expect(result).toBe(expected);
  });
});
