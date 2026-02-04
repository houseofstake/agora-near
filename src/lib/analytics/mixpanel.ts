/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import mixpanel from "mixpanel-browser";
import Tenant from "@/lib/tenant/tenant";

type PageEventProps = {
  path: string;
  title?: string;
};

let initialized = false;

function analyticsEnabled(): boolean {
  const { ui } = Tenant.current();
  const envToggle =
    process.env.NEXT_PUBLIC_ENABLE_BI_METRICS_CAPTURE === "true";
  const uiToggle = ui.toggle("analytics")
    ? ui.toggle("analytics")?.enabled
    : true;
  return envToggle && !!uiToggle;
}

export function initMixpanel() {
  if (initialized) return;
  if (typeof window === "undefined") return;
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) return;
  mixpanel.init(token, { debug: process.env.NODE_ENV !== "production" });
  initialized = true;
}

export function track(event: string, props?: Record<string, any>) {
  if (!analyticsEnabled()) return;
  if (!initialized) initMixpanel();
  if (initialized) {
    mixpanel.track(event, props);
  }
}

export function identify(userId?: string) {
  if (!analyticsEnabled()) return;
  if (!initialized) initMixpanel();
  if (!initialized || !userId) return;
  mixpanel.identify(userId);
}

export function alias(userId: string) {
  if (!analyticsEnabled()) return;
  if (!initialized) initMixpanel();
  if (!initialized || !userId) return;
  mixpanel.alias(userId);
}

export function setPeopleProperties(props: Record<string, any>) {
  if (!analyticsEnabled()) return;
  if (!initialized) initMixpanel();
  if (!initialized) return;
  mixpanel.people.set(props);
}

export function registerSuperProperties(props: Record<string, any>) {
  if (!analyticsEnabled()) return;
  if (!initialized) initMixpanel();
  if (!initialized) return;
  mixpanel.register(props);
}

export function pageView({ path, title }: PageEventProps) {
  track("Page View", {
    path,
    title:
      title ?? (typeof document !== "undefined" ? document.title : undefined),
  });
}

export const MixpanelEvents = {
  StartedLockAndStake: "Started Lock and Stake",
  LockedNEAR: "Locked NEAR",
  LockedNEARWithLST: "Locked NEAR with LST",
  UnlockedNEAR: "Unlocked NEAR",
  Delegated: "Delegated",
  CreatedDelegateStatement: "Created Delegate Statement",
  SavedNearSocialProfile: "Saved Near Social Profile",
  ProposalCreated: "Proposal Created",
  VotedOnProposal: "Voted on Proposal",
  FAQExpanded: "FAQ Expanded",
  ExternalLinkClicked: "External Link Clicked",
};
