"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

import DelegateStatementForm from "@/components/DelegateStatement/DelegateStatementForm";
import AgoraLoader from "@/components/shared/AgoraLoader/AgoraLoader";
import { useNear } from "@/contexts/NearContext";
import { useDelegateProfile } from "@/hooks/useDelegateProfile";
import { useNearSocialProfile } from "@/hooks/useNearSocialProfile";
import Tenant from "@/lib/tenant/tenant";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ResourceNotFound from "../shared/ResourceNotFound/ResourceNotFound";
import {
  DelegateProfile,
  defaultNotificationPreferences,
} from "@/lib/api/delegates/types";

export type DelegateStatementFormValues = z.infer<typeof formSchema>;

export const DELEGATE_PROFILE_LIMITS = {
  displayName: 80,
  delegateStatement: 4000,
  handle: 50,
  email: 254,
  topIssueType: 50,
  topIssueValue: 280,
} as const;

const formSchema = z.object({
  agreeCodeConduct: z.boolean(),
  discord: z.string().max(DELEGATE_PROFILE_LIMITS.handle),
  delegateStatement: z.string().max(DELEGATE_PROFILE_LIMITS.delegateStatement),
  displayName: z.string().max(DELEGATE_PROFILE_LIMITS.displayName).optional(),
  email: z.string().max(DELEGATE_PROFILE_LIMITS.email),
  twitter: z.string().max(DELEGATE_PROFILE_LIMITS.handle),
  warpcast: z.string().max(DELEGATE_PROFILE_LIMITS.handle),
  topIssues: z.array(
    z
      .object({
        type: z.string().max(DELEGATE_PROFILE_LIMITS.topIssueType),
        value: z.string().max(DELEGATE_PROFILE_LIMITS.topIssueValue),
      })
      .strict()
  ),
  notificationPreferences: z.object({
    wants_proposal_created_email: z.enum(["true", "false", "prompt"]),
    wants_proposal_ending_soon_email: z.enum(["true", "false", "prompt"]),
  }),
});

export default function CurrentDelegateStatement() {
  const { ui } = Tenant.current();

  const { signedAccountId, isInitialized } = useNear();
  const isConnected = !!signedAccountId;

  const { data: delegate, isLoading } = useDelegateProfile({
    accountId: signedAccountId,
  });

  const { data: nearSocialProfile } = useNearSocialProfile(signedAccountId);

  const topIssues = ui.governanceIssues;
  const defaultIssues = useMemo(
    () =>
      !topIssues
        ? []
        : topIssues.map((issue) => ({
            type: issue.key,
            value: "",
          })),
    [topIssues]
  );

  const requireCodeOfConduct = !!ui.toggle("delegates/code-of-conduct")
    ?.enabled;

  const getDefaultValues = useCallback(
    (delegateProfile: DelegateProfile | undefined) => {
      const defaultPrefs = defaultNotificationPreferences();
      return {
        agreeCodeConduct: !requireCodeOfConduct,
        discord: delegateProfile?.discord || "",
        delegateStatement: delegateProfile?.statement || "",
        displayName: "",
        email: delegateProfile?.email || "",
        twitter: delegateProfile?.twitter || "",
        warpcast: delegateProfile?.warpcast || "",
        topIssues:
          (delegateProfile?.topIssues ?? []).length > 0
            ? (delegateProfile?.topIssues ?? defaultIssues)
            : defaultIssues,
        notificationPreferences: {
          wants_proposal_created_email:
            delegateProfile?.notificationPreferences
              ?.wants_proposal_created_email ||
            defaultPrefs.wants_proposal_created_email,
          wants_proposal_ending_soon_email:
            delegateProfile?.notificationPreferences
              ?.wants_proposal_ending_soon_email ||
            defaultPrefs.wants_proposal_ending_soon_email,
        },
      };
    },
    [requireCodeOfConduct, defaultIssues]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(delegate),
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(getDefaultValues(delegate));
  }, [form, getDefaultValues, delegate]);

  // Set display name from Near Social only once when it loads
  const displayNameInitialized = useRef(false);
  useEffect(() => {
    displayNameInitialized.current = false;
  }, [signedAccountId]);
  useEffect(() => {
    if (
      nearSocialProfile?.name &&
      !displayNameInitialized.current &&
      !form.formState.isDirty
    ) {
      form.setValue("displayName", nearSocialProfile.name);
      displayNameInitialized.current = true;
    }
  }, [nearSocialProfile, form]);

  if (isLoading || !isInitialized) {
    return <AgoraLoader />;
  }

  if (!isConnected) {
    return <ResourceNotFound message="Oops! Nothing's here" />;
  }

  return <DelegateStatementForm form={form} delegate={delegate} />;
}
