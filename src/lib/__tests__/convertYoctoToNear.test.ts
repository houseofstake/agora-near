import { convertYoctoToNear } from "@/lib/utils";
import { describe, it, expect } from "vitest";

// Helper to create yoctoNEAR amount from NEAR value using BigInt for precision
const toYocto = (nearAmount: bigint) => (nearAmount * 10n ** 24n).toString();

describe("convertYoctoToNear", () => {
  it("should convert small amounts correctly (1 yoctoNEAR -> 0.000000000000000000000001)", () => {
    const result = convertYoctoToNear("1");
    expect(result).toBe("0.000000000000000000000001");
  });

  it("should convert exactly 1 NEAR correctly", () => {
    const result = convertYoctoToNear(toYocto(1n));
    expect(result).toBe("1");
  });

  it("should convert 1000 NEAR correctly and not include commas", () => {
    const result = convertYoctoToNear(toYocto(1000n));
    expect(result).toBe("1000");
    expect(result).not.toContain(",");
  });

  it("should convert values greater than 1000 NEAR correctly and not include commas", () => {
    const nearValue = 1234n;
    const result = convertYoctoToNear(toYocto(nearValue));
    expect(result).toBe(nearValue.toString());
    expect(result).not.toContain(",");
  });
});
