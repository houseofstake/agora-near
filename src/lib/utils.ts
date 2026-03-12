import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Tenant from "./tenant/tenant";
import { NANO_SECONDS_IN_DAY } from "./constants";
import Big from "big.js";
import { baseApiUrl } from "./api/constants";
import { NEAR_NOMINATION_EXP } from "@near-js/utils";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function bpsToString(bps: number) {
  return `${(Math.round(bps * 100) / 100).toFixed(2)}%`;
}

const format = new Intl.NumberFormat("en", {
  style: "decimal",
  maximumSignificantDigits: 3,
  notation: "compact",
});

export function pluralizeAddresses(count: number) {
  if (count === 1) {
    return "1 address";
  } else {
    return `${format.format(count).toLowerCase()} addresses`;
  }
}

export function pluralize(word: string, count: number) {
  if (count === 1) {
    return `1 ${word}`;
  }
  let pluralWord = word;
  pluralWord += "s";
  if (word[0] === word[0].toUpperCase()) {
    pluralWord = pluralWord.charAt(0).toUpperCase() + pluralWord.slice(1);
  }
  return `${count} ${pluralWord}`;
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLocaleLowerCase();
}

/**
 * Check if a string is in scientific notation
 * @param input
 */
export function isScientificNotation(input: string) {
  const scientificNotationRegex = /^[+-]?\d+(\.\d+)?[eE][+-]?\d+$/;
  return scientificNotationRegex.test(input);
}

/**
 * Convert a string in scientific notation to precision BigInt
 * @param input
 */
export function scientificNotationToPrecision(input: string) {
  if (isScientificNotation(input)) {
    const parts = input.split("e");
    const base = parts[0].replace(".", "");
    const exponent = parseInt(parts[1], 10) - (base.length - 1);
    return BigInt(base) * 10n ** BigInt(exponent);
  } else {
    return BigInt(input);
  }
}

// TODO: Rename ot scientificNotationTo number or something better fitting
export function formatNumberWithScientificNotation(x: number): string {
  if (x === 0) {
    return "0";
  }

  const scientificNotation = x.toExponential();
  const [base, exponent] = scientificNotation.split("e");
  const exp = parseInt(exponent, 10);

  // Format small numbers (abs(x) < 1.0)
  if (Math.abs(x) < 1.0) {
    const leadingZeros = Math.max(0, Math.abs(exp) - 1);
    return `0.${"0".repeat(leadingZeros)}${base.replace(".", "")}`;
  }

  // Format large numbers and numbers with exponent 0
  if (exp >= 0) {
    const [integerPart, fractionalPart] = base.split(".");
    const zerosNeeded = exp - (fractionalPart ? fractionalPart.length : 0);
    return (
      integerPart +
      (fractionalPart || "") +
      "0".repeat(Math.max(zerosNeeded, 0))
    );
  }

  return scientificNotation;
}

export function formatPercentageWithPrecision(
  value: number,
  precision: number
) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(precision);
}

export function humanizeNumber(
  n: number,
  options: { delimiter?: string; separator?: string } = {}
): string {
  options = options || {};
  const d = options.delimiter || ",";
  const s = options.separator || ".";
  const result = n.toString().split(".");
  result[0] = result[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + d);
  return result.join(s);
}

export function humanizeNumberContact(n: number, digits: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: digits,
  }).format(n);
}

/**
 * Formats voting power numbers with intelligent scaling based on the maximum value.
 * Uses B/M/K suffixes when appropriate and maintains 3 significant figures.
 *
 * @param value - The number to format
 * @param maxValue - The maximum value in the set (used to determine scaling)
 * @returns Formatted string with appropriate suffix
 */
export function formatVotingPower(value: number, maxValue: number): string {
  // Determine the suffix based on the maximum value
  let suffix = "";
  let divisor = 1;

  if (maxValue >= 1_000_000_000) {
    suffix = "B";
    divisor = 1_000_000_000;
  } else if (maxValue >= 1_000_000) {
    suffix = "M";
    divisor = 1_000_000;
  } else if (maxValue >= 1_000) {
    suffix = "K";
    divisor = 1_000;
  }

  // Divide the value by the divisor
  const scaledValue = value / divisor;

  // Round to 3 significant figures
  let formattedValue: string;

  if (scaledValue === 0) {
    formattedValue = "0";
  } else {
    // Calculate number of decimal places needed for 3 sig figs
    const magnitude = Math.floor(Math.log10(Math.abs(scaledValue)));
    const decimalPlaces = Math.max(0, 2 - magnitude);

    // Round to appropriate decimal places
    formattedValue = scaledValue.toFixed(decimalPlaces);

    if (formattedValue.includes(".")) {
      formattedValue = formattedValue.replace(/\.?0+$/, "");
    }
  }

  return formattedValue + suffix;
}

export function tokenToHumanNumber(amount: number, decimals: number) {
  return Math.floor(amount / Math.pow(10, decimals));
}

export function numberToToken(number: number) {
  const { token } = Tenant.current();
  return BigInt(number * Math.pow(10, token.decimals));
}

export function formatNumber(
  amount: string | bigint,
  decimals: number,
  maximumSignificantDigits = 4,
  useSpecialFormatting?: boolean,
  useCompactDisplay = true,
  minimumFractionDigits = 0,
  trailingZeroDisplay?: Intl.NumberFormatOptions["trailingZeroDisplay"]
) {
  let bigIntAmount: bigint;

  if (typeof amount === "string") {
    if (amount.includes("e")) {
      bigIntAmount = scientificNotationToPrecision(amount);
    } else {
      const integerPart = amount.split(".")[0] || "0";
      bigIntAmount = BigInt(integerPart);
    }
  } else {
    bigIntAmount = amount;
  }

  // Convert to standard unit
  const divisor = BigInt(10) ** BigInt(decimals);
  const wholePart = bigIntAmount / divisor;
  const fractionalPart = bigIntAmount % divisor;

  // Convert to number for formatting
  const standardUnitAmount =
    Number(wholePart) + Number(fractionalPart) / Number(divisor);

  if (useSpecialFormatting) {
    if (standardUnitAmount === 0) return "";
    if (standardUnitAmount >= 1.5) {
      const rounded = Math.round(standardUnitAmount);
      return new Intl.NumberFormat("en", {
        maximumFractionDigits: 0,
      }).format(rounded);
    }
    if (standardUnitAmount >= 1) return "~1";
    if (standardUnitAmount > 0) return "<1";
  }

  const numberFormat = new Intl.NumberFormat("en", {
    notation: useCompactDisplay ? "compact" : "standard",
    maximumFractionDigits: maximumSignificantDigits,
    minimumFractionDigits,
    trailingZeroDisplay,
  });

  return numberFormat.format(standardUnitAmount);
}

export function formatFullDate(date: Date): string {
  const getOrdinalSuffix = (day: number) => {
    const j = day % 10,
      k = day % 100;
    if (j === 1 && k !== 11) {
      return "st";
    }
    if (j === 2 && k !== 12) {
      return "nd";
    }
    if (j === 3 && k !== 13) {
      return "rd";
    }
    return "th";
  };

  const day = date.getDate();
  const ordinalDay = `${day}${getOrdinalSuffix(day)}`;

  const formattedDate =
    new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(date) +
    ` ${ordinalDay}, ` +
    date.getFullYear();

  return formattedDate;
}

export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function delay(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export const getRpcUrl = (
  networkId: string,
  params: { useArchivalNode: boolean }
) => {
  const url = `${baseApiUrl}/${params.useArchivalNode ? "archival-rpc" : "rpc"}/${networkId}`;
  return url;
};

export const convertNanoSecondsToDays = (nanoSeconds: string) => {
  return Number(nanoSeconds) / NANO_SECONDS_IN_DAY;
};

export const formatNanoSecondsToTimeUnit = (nanoSeconds: string | number) => {
  const nanoSecondsNum =
    typeof nanoSeconds === "string" ? Number(nanoSeconds) : nanoSeconds;

  // Constants for conversion
  const NANO_SECONDS_IN_MINUTE = 1000000000 * 60; // 60 billion nanoseconds
  const NANO_SECONDS_IN_HOUR = NANO_SECONDS_IN_MINUTE * 60; // 3.6 trillion nanoseconds

  // Convert to days if >= 1 day
  if (nanoSecondsNum >= NANO_SECONDS_IN_DAY) {
    const days = nanoSecondsNum / NANO_SECONDS_IN_DAY;
    const roundedDays = Math.round(days * 10) / 10; // Round to 1 decimal place
    return roundedDays === 1 ? "1 day" : `${roundedDays} days`;
  }

  // Convert to hours if >= 1 hour
  if (nanoSecondsNum >= NANO_SECONDS_IN_HOUR) {
    const hours = nanoSecondsNum / NANO_SECONDS_IN_HOUR;
    const roundedHours = Math.round(hours * 10) / 10; // Round to 1 decimal place
    return roundedHours === 1 ? "1 hour" : `${roundedHours} hours`;
  }

  // Convert to minutes if >= 1 minute
  if (nanoSecondsNum >= NANO_SECONDS_IN_MINUTE) {
    const minutes = nanoSecondsNum / NANO_SECONDS_IN_MINUTE;
    const roundedMinutes = Math.round(minutes * 10) / 10; // Round to 1 decimal place
    return roundedMinutes === 1 ? "1 minute" : `${roundedMinutes} minutes`;
  }

  // For very small amounts, show seconds
  const seconds = nanoSecondsNum / 1000000000;
  const roundedSeconds = Math.round(seconds * 10) / 10;

  if (roundedSeconds < 0.1) {
    return "< 0.1 seconds";
  }

  return roundedSeconds === 1 ? "1 second" : `${roundedSeconds} seconds`;
};

export const convertYoctoToTGas = (yocto: string) => {
  return new Big(yocto).div(10 ** 12).toFixed();
};

export const isValidNearAmount = (amount?: string) => {
  if (!amount) {
    return false;
  }

  if (isNaN(Number(amount))) {
    return false;
  }

  const decimalParts = amount.split(".");
  if (decimalParts.length > 1 && decimalParts[1].length > NEAR_NOMINATION_EXP) {
    return false;
  }

  return true;
};

export const yoctoNearToUsdFormatted = (
  yoctoNearAmount: string,
  nearPrice: string
) => {
  const nearInUsd = Big(convertYoctoToNear(yoctoNearAmount)).mul(nearPrice);

  const formattedUsdAmount = new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(nearInUsd.toNumber());

  return formattedUsdAmount;
};

export const formatNearBlockHash = (blockHash?: string) => {
  if (!blockHash) {
    return "";
  }

  if (blockHash.length <= 15) {
    return blockHash;
  }

  return `${blockHash.slice(0, 6)}...${blockHash.slice(-6)}`;
};

export const convertStakingTokenToNear = (
  stakingTokenAmount?: string | null,
  exchangeRate?: string | null
) => {
  if (!stakingTokenAmount || !exchangeRate) return "0";

  try {
    const nearAmount = new Big(stakingTokenAmount)
      .div(10 ** NEAR_NOMINATION_EXP)
      .times(new Big(exchangeRate));

    return nearAmount.toFixed(0);
  } catch (e) {
    return "0";
  }
};

export const convertNearToStakingToken = (
  nearAmount?: string | null,
  exchangeRate?: string | null
) => {
  if (!nearAmount || !exchangeRate) return "0";

  try {
    const stakingTokenPerNear = Big(10 ** NEAR_NOMINATION_EXP).div(
      Big(exchangeRate)
    );

    const convertedAmount = stakingTokenPerNear.mul(Big(nearAmount));

    return convertedAmount.toFixed(0);
  } catch (e) {
    return "0";
  }
};

/**
 * Browser detection utilities
 */
export const getBrowserType = () => {
  if (typeof window === "undefined") return null;

  const userAgent = window.navigator.userAgent;
  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    return "chrome";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    return "safari";
  }
  return "other";
};

export const getPopupHelpLink = (browserType: string | null) => {
  switch (browserType) {
    case "chrome":
      return "https://support.google.com/chrome/answer/95472";
    case "safari":
      return "https://support.apple.com/guide/safari/manage-pop-ups-sfri40696/mac";
    default:
      return "https://support.google.com/chrome/answer/95472"; // Default to Chrome instructions
  }
};

export const convertYoctoToNear = (yocto: string, precision?: number) => {
  return Big(yocto)
    .div(10 ** NEAR_NOMINATION_EXP)
    .toFixed(precision);
};
