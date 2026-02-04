import Tenant from "@/lib/tenant/tenant";
import { NearSocialProfile } from "./types";

const MAINNET_CONTRACT_ID = "social.near";
const TESTNET_CONTRACT_ID = "v1.social08.testnet";

export const getNearSocialContractId = () => {
  const { networkId } = Tenant.current();
  return networkId === "mainnet" ? MAINNET_CONTRACT_ID : TESTNET_CONTRACT_ID;
};

const readLeafString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    "" in (value as Record<string, unknown>) &&
    typeof (value as Record<string, unknown>)[""] === "string"
  ) {
    return (value as Record<string, string>)[""];
  }

  return undefined;
};

const parseTopIssuesString = (
  value: string | undefined
): { type: string; value: string }[] | undefined => {
  if (!value) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof (item as Record<string, unknown>).type === "string" &&
            typeof (item as Record<string, unknown>).value === "string"
        )
        .map((item) => ({
          type: (item as Record<string, string>).type,
          value: (item as Record<string, string>).value,
        }));
    }
  } catch {
    return undefined;
  }

  return undefined;
};

const parseTopIssuesMap = (
  value: Record<string, unknown>
): { type: string; value: string }[] => {
  return Object.keys(value).map((key) => ({
    type: key,
    value: readLeafString(value[key]) ?? "",
  }));
};

export const extractNearSocialProfile = (
  response: unknown,
  accountId: string
): NearSocialProfile | null => {
  if (!response || typeof response !== "object") {
    return null;
  }

  const accountNode = (response as Record<string, unknown>)[accountId];
  if (!accountNode || typeof accountNode !== "object") {
    return null;
  }

  // Navigate to hos.profile (path: {accountId}/hos/profile)
  const hosNode = (accountNode as Record<string, unknown>).hos;
  if (!hosNode || typeof hosNode !== "object") {
    return null;
  }

  const profileNode = (hosNode as Record<string, unknown>).profile;
  if (!profileNode || typeof profileNode !== "object") {
    return null;
  }

  const profile = profileNode as Record<string, unknown>;
  const name = readLeafString(profile.name);
  const statement = readLeafString(profile.statement);

  // Parse topIssues array
  let topIssues: { type: string; value: string }[] | undefined;
  const topIssuesLeaf = readLeafString(profile.topIssues);
  topIssues = parseTopIssuesString(topIssuesLeaf);
  if (!topIssues && profile.topIssues && typeof profile.topIssues === "object") {
    const topIssuesObj = profile.topIssues as Record<string, unknown>;
    const numericKeys = Object.keys(topIssuesObj).filter(
      (key) => !isNaN(Number(key))
    );
    if (numericKeys.length > 0) {
      topIssues = numericKeys
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => {
          const item = topIssuesObj[key] as Record<string, unknown>;
          return {
            type: readLeafString(item?.type) ?? "",
            value: readLeafString(item?.value) ?? "",
          };
        });
    } else {
      topIssues = parseTopIssuesMap(topIssuesObj);
    }
  }

  return {
    name,
    statement,
    topIssues,
    codeOfConductSigned:
      readLeafString(profile.codeOfConductSigned) === "Signed"
        ? "Signed"
        : undefined,
  };
};

export const extractRawNearSocialProfile = (
  response: unknown,
  accountId: string
): Record<string, unknown> | null => {
  if (!response || typeof response !== "object") {
    return null;
  }

  const accountNode = (response as Record<string, unknown>)[accountId];
  if (!accountNode || typeof accountNode !== "object") {
    return null;
  }

  const hosNode = (accountNode as Record<string, unknown>).hos;
  if (!hosNode || typeof hosNode !== "object") {
    return null;
  }

  const profileNode = (hosNode as Record<string, unknown>).profile;
  if (!profileNode || typeof profileNode !== "object") {
    return null;
  }

  return profileNode as Record<string, unknown>;
};

export const mergeNearSocialProfile = (
  existingRaw: Record<string, unknown> | null,
  update: NearSocialProfile
): Record<string, unknown> => {
  // Preserve unknown keys from existing profile
  const merged: Record<string, unknown> = { ...(existingRaw ?? {}) };

  // Only overwrite keys that are explicitly provided in update
  if (update.name !== undefined) merged.name = update.name;
  if (update.statement !== undefined) merged.statement = update.statement;
  // topIssues: stored as JSON string, replaces entirely (array preserves all items)
  if (update.topIssues !== undefined) merged.topIssues = update.topIssues;
  if (update.codeOfConductSigned !== undefined) {
    merged.codeOfConductSigned = update.codeOfConductSigned;
  }

  return merged;
};

export const extractNearSocialDisplayNames = (
  response: unknown,
  accountIds: string[]
): Record<string, string | undefined> => {
  if (!response || typeof response !== "object") {
    return {};
  }

  const responseRecord = response as Record<string, unknown>;
  return accountIds.reduce<Record<string, string | undefined>>(
    (acc, accountId) => {
      const accountNode = responseRecord[accountId];
      if (!accountNode || typeof accountNode !== "object") {
        acc[accountId] = undefined;
        return acc;
      }

      // Navigate to hos.profile.name (path: {accountId}/hos/profile/name)
      const hosNode = (accountNode as Record<string, unknown>).hos;
      if (!hosNode || typeof hosNode !== "object") {
        acc[accountId] = undefined;
        return acc;
      }

      const profileNode = (hosNode as Record<string, unknown>).profile;
      if (!profileNode || typeof profileNode !== "object") {
        acc[accountId] = undefined;
        return acc;
      }

      const nameValue = (profileNode as Record<string, unknown>).name;
      acc[accountId] = readLeafString(nameValue);
      return acc;
    },
    {}
  );
};

/**
 * Calculate the byte size of a Near Social profile payload.
 * Uses TextEncoder to accurately measure UTF-8 byte length.
 */
export const calculatePayloadSize = (payload: unknown): number => {
  return new TextEncoder().encode(JSON.stringify(payload)).length;
};

/**
 * Validate that a Near Social profile payload is within size limits.
 * @param payload - The profile payload to validate
 * @param maxBytes - Maximum allowed size in bytes (default: 10000, fits 0.1 NEAR deposit)
 * @returns Object with isValid boolean and current size in bytes
 */
export const validatePayloadSize = (
  payload: unknown,
  maxBytes: number = 10000
): { isValid: boolean; size: number; maxBytes: number } => {
  const size = calculatePayloadSize(payload);
  return {
    isValid: size <= maxBytes,
    size,
    maxBytes,
  };
};
