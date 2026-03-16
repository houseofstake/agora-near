import { NEAR_TOKEN } from "@/lib/constants";
import { cn, formatNumber } from "@/lib/utils";
import { useMemo } from "react";
import Big from "big.js";
import { TooltipWithTap } from "../ui/tooltip-with-tap";

type Props = {
  amount: string | bigint;
  maximumSignificantDigits?: number;
  hideCurrency?: boolean;
  currency?: string;
  compact?: boolean;
  minimumFractionDigits?: number;
  className?: string;
  trailingSpace?: boolean;
  showDustTooltip?: boolean;
};

const DEFAULT_MIN_DIGITS = 4;

export default function TokenAmount({
  amount,
  maximumSignificantDigits,
  hideCurrency = false,
  compact = true,
  currency = NEAR_TOKEN.symbol,
  minimumFractionDigits,
  className,
  trailingSpace = true,
  showDustTooltip = false,
}: Props) {
  const minDigits = useMemo(() => {
    return Math.min(
      minimumFractionDigits ?? DEFAULT_MIN_DIGITS,
      maximumSignificantDigits ?? DEFAULT_MIN_DIGITS
    );
  }, [minimumFractionDigits, maximumSignificantDigits]);

  const formattedNumber = useMemo(() => {
    const formattedNearAmount = formatNumber(
      amount,
      NEAR_TOKEN.decimals,
      maximumSignificantDigits,
      false,
      compact,
      minDigits,
      "stripIfInteger"
    );

    return formattedNearAmount;
  }, [amount, compact, maximumSignificantDigits, minDigits]);

  const isDust = useMemo(() => {
    if (!amount) return false;
    try {
      const amountBig = Big(amount.toString());
      return amountBig.gt(0) && amountBig.lt(Big(10).pow(20));
    } catch (e) {
      // Prevent UI crash if an invalid string (e.g., "NaN") is accidentally passed
      return false;
    }
  }, [amount]);

  if (showDustTooltip && isDust) {
    return (
      <TooltipWithTap
        content={
          <div className="flex flex-col text-center p-2">
            <p className="font-semibold text-sm">Dust Amount</p>
            <p className="font-mono text-xs">{amount.toString()} yocto</p>
          </div>
        }
      >
        <span className={cn("cursor-pointer", className)}>
          {`~0${hideCurrency ? "" : ` ${currency}`}${trailingSpace ? " " : ""}`}
        </span>
      </TooltipWithTap>
    );
  }

  return (
    <span className={cn(className)}>
      {`${formattedNumber}${hideCurrency ? "" : ` ${currency}`}${trailingSpace ? " " : ""}`}
    </span>
  );
}
