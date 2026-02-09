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
  async trackEvent(event: AnalyticsPayload) {
    const { slug } = Tenant.current();
    const normalizedName = mapEventName(event.event_name);
    const enrichedData = enrichYoctoFields(event.event_data);
    const payload = {
      ...event,
      event_name: normalizedName,
      event_data: {
        ...enrichedData,
        dao_slug: slug,
      },
    };

    // 1) Mixpanel
    trackMixpanel.track(payload.event_name, payload.event_data);

    // 2) Backend (optional, if API key is present)
    const apiKey = process.env.NEXT_PUBLIC_AGORA_API_KEY;
    if (apiKey) {
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
  identifyUser(userId: string) {
    // 1) Mixpanel
    // We want to identify the user if they were previously anonymous
    // mixpanel.alias(userId) is ideally called on sign-up, but here we'll use identify
    // If we want to link pre-signin events, we might need alias logic in the UI
    trackMixpanel.identify(userId);

    // 2) Google Analytics
    // Set user_id
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
}

const manager = new AnalyticsManager();
export const trackEvent = (event: AnalyticsPayload) =>
  manager.trackEvent(event);

export const identifyUser = (userId: string) => manager.identifyUser(userId);

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
