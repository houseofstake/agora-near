import Tenant from "@/lib/tenant/tenant";
import * as trackMixpanel from "./mixpanel";

import { formatNearAmount } from "@near-js/utils";

export type AnalyticsPayload = {
  event_name: string;
  event_data?: Record<string, unknown>;
};

// Normalize event names coming from different sources
const EVENT_NAME_MAP: Record<string, string> = {
  // Exact NEAR events (left as-is)
  "Started Lock and Stake": "Started Lock and Stake",
  "Locked NEAR": "Locked NEAR",
  "Locked NEAR with LST": "Locked NEAR with LST",
  "Unlocked NEAR": "Unlocked NEAR",
  Delegated: "Delegated",
  "Created Delegate Statement": "Created Delegate Statement",
  "Proposal Created": "Proposal Created",
  "Voted on Proposal": "Voted on Proposal",
  "Page View": "Page View",

  // agora-next enum style → NEAR mixpanel names
  STANDARD_VOTE: "Voted on Proposal",
  ADVANCED_VOTE: "Voted on Proposal",
  CREATE_PROPOSAL: "Proposal Created",
  DELEGATE: "Delegated",
  ADVANCED_DELEGATE: "Delegated",
  PARTIAL_DELEGATION: "Delegated",
  SHARE_VOTE: "Share Vote",
};

function mapEventName(name: string): string {
  if (!name) return name;
  const direct = EVENT_NAME_MAP[name];
  if (direct) return direct;
  const upper = EVENT_NAME_MAP[name.toUpperCase()];
  if (upper) return upper;
  return name;
}

class AnalyticsManager {
  private currentWalletAddress: string | null = null;
  private hasAliased = false;

  async trackEvent(event: AnalyticsPayload) {
    const { slug } = Tenant.current();
    const normalizedName = mapEventName(event.event_name);
    const enrichedData = enrichYoctoFields(event.event_data);
    const payload = {
      ...event,
      event_name: normalizedName,
      event_data: {
        ...enrichedData,
        ...(this.currentWalletAddress && {
          wallet_address: this.currentWalletAddress,
        }),
        app_environment: this.getEnvironment(),
        app_url:
          typeof window !== "undefined" ? window.location.href : "server",
      },
    };

    // 1) Mixpanel (wallet_address also injected via super properties)
    trackMixpanel.track(payload.event_name, payload.event_data);

    // 2) Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", payload.event_name, payload.event_data);
    }

    // 3) Backend (optional, if API key is present)
    // Only enabled in production to prevent 404 spam in local development
    const apiKey = process.env.NEXT_PUBLIC_AGORA_API_KEY;
    if (apiKey && process.env.NODE_ENV === "production") {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload, (_k, v) =>
            typeof v === "bigint" ? v.toString() : (v ?? null)
          ),
        });
      } catch (_e) {
        // swallow errors
      }
    }
  }

  identifyUser(
    userId: string,
    properties?: {
      wallet_type?: string;
      is_fireblocks?: boolean;
      total_near_locked_yocto?: string;
      total_venear_balance?: string;
      is_delegate?: boolean;
      delegation_count?: string;
      has_voted?: boolean;
      lockup_count?: number;
    }
  ) {
    this.currentWalletAddress = userId;

    // 1) Mixpanel: alias (first connect only) → links anonymous pre-connect session
    if (!this.hasAliased) {
      trackMixpanel.alias(userId);
      this.hasAliased = true;
    }

    // 2) Mixpanel: identify
    trackMixpanel.identify(userId);

    // 3) Mixpanel: register wallet_address as super property (auto-injected on all events)
    trackMixpanel.registerSuperProperties({ wallet_address: userId });

    // 4) Mixpanel: set user profile properties
    trackMixpanel.setPeopleProperties({
      $name: userId,
      wallet_address: userId,
      first_seen: new Date().toISOString(),
      ...(properties?.wallet_type && { wallet_type: properties.wallet_type }),
      ...(properties?.is_fireblocks !== undefined && {
        is_fireblocks: properties.is_fireblocks,
      }),
      ...(properties?.total_near_locked_yocto && {
        total_near_locked_yocto: properties.total_near_locked_yocto,
      }),
      ...(properties?.total_venear_balance && {
        total_venear_balance: properties.total_venear_balance,
      }),
      ...(properties?.is_delegate !== undefined && {
        is_delegate: properties.is_delegate,
      }),
      ...(properties?.delegation_count && {
        delegation_count: properties.delegation_count,
      }),
      ...(properties?.has_voted !== undefined && {
        has_voted: properties.has_voted,
      }),
      ...(properties?.lockup_count !== undefined && {
        lockup_count: properties.lockup_count,
      }),
    });

    // 5) Google Analytics: set user_id
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag(
        "config",
        process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
        {
          user_id: userId,
        }
      );
    }
  }

  clearIdentity() {
    this.currentWalletAddress = null;
  }

  private getEnvironment(): string {
    if (process.env.NEXT_PUBLIC_VERCEL_ENV) {
      return process.env.NEXT_PUBLIC_VERCEL_ENV;
    }
    if (typeof window !== "undefined") {
      if (window.location.hostname.includes("localhost")) return "development";
      if (window.location.hostname.includes("vercel.app")) return "preview";
    }
    return process.env.NODE_ENV || "unknown";
  }
}

const manager = new AnalyticsManager();
export const trackEvent = (event: AnalyticsPayload) =>
  manager.trackEvent(event);

export const identifyUser = (
  userId: string,
  properties?: {
    wallet_type?: string;
    is_fireblocks?: boolean;
    total_near_locked_yocto?: string;
    total_venear_balance?: string;
    is_delegate?: boolean;
    delegation_count?: string;
    has_voted?: boolean;
    lockup_count?: number;
  }
) => manager.identifyUser(userId, properties);

export const clearIdentity = () => manager.clearIdentity();

function enrichYoctoFields(data?: Record<string, unknown>) {
  if (!data) return data;
  const result: Record<string, unknown> = { ...data };
  for (const [key, value] of Object.entries(data)) {
    if (
      typeof value === "string" &&
      /yocto/i.test(key) &&
      /^\d+$/.test(value)
    ) {
      const near = safelyFormatNear(value);
      const nearKey = key.replace(/yocto/gi, "Near");
      result[nearKey] = near;
    }
  }
  return result;
}

function safelyFormatNear(yocto: string): string {
  try {
    return formatNearAmount(yocto);
  } catch (_e) {
    return yocto;
  }
}
