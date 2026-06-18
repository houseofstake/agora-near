import { StakingPool, TenantToken, TokenMetadata } from "./types";
import nearAssetIcon from "@/assets/near_icon.jpg";
import linearAssetIcon from "@/assets/linear.svg";
import stnearAssetIcon from "@/assets/stnear.svg";
import veNearAssetIcon from "@/assets/venear.svg";
import rnearAssetIcon from "@/assets/rnear.svg";
import Big from "big.js";
import { NEAR_NOMINATION_EXP } from "@near-js/utils";

export const SECONDS_IN_HOUR = 3600;

export const TENANT_NAMESPACES = {
  NEAR: "near",
} as const;

export const delegatesSortOptions = {
  weightedRandom: {
    sort: "weighted_random",
    value: "Random (default)",
  },
  mostVotingPower: {
    sort: "most_voting_power",
    value: "Most voting power",
  },
  mostDelegators: {
    sort: "least_voting_power",
    value: "Least voting power",
  },
};

export const delegatesFilterOptions = {
  all: {
    value: "All (default)",
    filter: "all",
  },
  endorsed: {
    value: "Endorsed",
    filter: "endorsed",
  },
};

export const NEAR_VOTING_OPTIONS = ["For", "Against", "Abstain"];

export const NEAR_TOKEN: TenantToken = {
  name: "NEAR Protocol",
  symbol: "NEAR",
  decimals: NEAR_NOMINATION_EXP,
};

export const VOTING_THRESHOLDS = {
  SIMPLE_MAJORITY: 51,
  SUPER_MAJORITY: 75,
};

export const CACHE_TTL = {
  SHORT: 1000 * 60 * 5, // 5 minutes
  MEDIUM: 1000 * 60 * 60, // 1 hour
  LONG: 1000 * 60 * 60 * 24, // 24 hours
};

export const NANO_SECONDS_IN_DAY = 1000000000 * 60 * 60 * 24;
export const NANO_SECONDS_IN_YEAR = 365 * NANO_SECONDS_IN_DAY;

export const LINEAR_TOKEN_CONTRACT = "linear-protocol.near";

export const STNEAR_TOKEN_CONTRACT = "meta-pool.near";

export const RNEAR_TOKEN_CONTRACT = "lst.rhealab.near";

export const NEAR_TOKEN_METADATA: TokenMetadata = {
  name: "NEAR",
  symbol: "NEAR",
  decimals: NEAR_NOMINATION_EXP,
  icon: nearAssetIcon,
};

export const LINEAR_TOKEN_METADATA: TokenMetadata = {
  name: "LiNEAR",
  symbol: "LINEAR",
  decimals: NEAR_NOMINATION_EXP,
  icon: linearAssetIcon,
};

export const STNEAR_TOKEN_METADATA: TokenMetadata = {
  name: "stNEAR",
  symbol: "STNEAR",
  decimals: NEAR_NOMINATION_EXP,
  icon: stnearAssetIcon,
};

export const VENEAR_TOKEN_METADATA: TokenMetadata = {
  name: "veNEAR",
  symbol: "VENEAR",
  decimals: NEAR_NOMINATION_EXP,
  icon: veNearAssetIcon,
};

export const RNEAR_TOKEN_METADATA: TokenMetadata = {
  name: "rNEAR",
  symbol: "rNEAR",
  decimals: NEAR_NOMINATION_EXP,
  icon: rnearAssetIcon,
};

export const LOCKUP_MIN_STORAGE_DEPOSIT = 0.2;

export const DEFAULT_GAS_RESERVE = "200000000000000000000000"; // 0.2 NEAR

export const LINEAR_POOL: StakingPool = {
  id: "linear",
  contract: LINEAR_TOKEN_CONTRACT,
  metadata: LINEAR_TOKEN_METADATA,
};

export const STNEAR_POOL: StakingPool = {
  id: "stnear",
  contract: STNEAR_TOKEN_CONTRACT,
  priceMethod: "get_st_near_price",
  metadata: STNEAR_TOKEN_METADATA,
};

export const RNEAR_POOL: StakingPool = {
  id: "rnear",
  contract: RNEAR_TOKEN_CONTRACT,
  metadata: RNEAR_TOKEN_METADATA,
};

// Represents the version where the lockup contract was updated to support locking LST tokens
export const MIN_VERSION_FOR_LST_LOCKUP = process.env.MIN_VERSION_FOR_LST_LOCKUP
  ? Number(process.env.MIN_VERSION_FOR_LST_LOCKUP)
  : Number.MAX_SAFE_INTEGER;

export const DEFAULT_QUORUM_THRESHOLD_PERCENTAGE_BPS = "3500";

export const LEGACY_STAKING_DISMISSED_KEY =
  "agora-legacy-staking-banner-dismissed";

// export const DEFAULT_QUORUM_FLOOR_VENEAR = "7000000"; // 7M veNEAR
export const DEFAULT_QUORUM_FLOOR_VENEAR = "10"; // 10 veNEAR (Dev override)

export const STAKE_ENCOURAGEMENT_BANNER_DISMISS_KEY =
  "agora-stake-encouragement-dismissed";
