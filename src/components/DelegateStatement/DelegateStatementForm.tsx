"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useNear } from "@/contexts/NearContext";
import { createDelegateStatement } from "@/lib/api/delegates/requests";

import Tenant from "@/lib/tenant/tenant";
import { useDelegateStatementStore } from "@/stores/delegateStatement";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";
import {
  type DelegateStatementFormValues,
  DELEGATE_PROFILE_LIMITS,
} from "./CurrentDelegateStatement";
import DelegateStatementFormSection from "./DelegateStatementFormSection";
import OtherInfoFormSection from "./OtherInfoFormSection";
import TopIssuesFormSection from "./TopIssuesFormSection";
import DelegateProfile from "../Delegates/DelegateProfile/DelegateProfile";
import { DelegateProfile as DelegateProfileType } from "@/lib/api/delegates/types";
import { MixpanelEvents } from "@/lib/analytics/mixpanel";
import { trackEvent as trackMixpanelEvent } from "@/lib/analytics";
import { sanitizeString } from "@/lib/sanitizationUtils";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useWriteNearSocialProfile } from "@/hooks/useWriteNearSocialProfile";
import { validatePayloadSize } from "@/lib/nearSocial";
import toast from "react-hot-toast";
import { NearSocialProfile } from "@/lib/nearSocial/types";

export default function DelegateStatementForm({
  form,
  delegate,
  nearSocialProfile,
  onResetToOffChain,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
  delegate?: DelegateProfileType;
  nearSocialProfile?: NearSocialProfile | null;
  onResetToOffChain?: () => void;
}) {
  const router = useRouter();
  const { ui } = Tenant.current();
  const { signMessage, signedAccountId, networkId } = useNear();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const { trackDelegateStatementEditorOpened, trackDelegateStatementSaved } =
    useAnalytics();
  const hasTrackedOpen = useRef(false);

  useEffect(() => {
    if (!hasTrackedOpen.current) {
      hasTrackedOpen.current = true;
      trackDelegateStatementEditorOpened({
        is_edit: !!delegate,
      });
    }
  }, [delegate, trackDelegateStatementEditorOpened]);
  const [saveToNearSocial, setSaveToNearSocial] = useState(false);
  const writeNearSocial = useWriteNearSocialProfile();
  const offChainSnapshotRef = useRef<DelegateStatementFormValues | null>(null);

  const hasTopIssues = Boolean(
    ui.governanceIssues && ui.governanceIssues.length > 0
  );

  const agreeCodeConduct = useWatch({
    control: form.control,
    name: "agreeCodeConduct",
  });

  const setSaveSuccess = useDelegateStatementStore(
    (state) => state.setSaveSuccess
  );
  const setNearSocialSaveSuccess = useDelegateStatementStore(
    (state) => state.setNearSocialSaveSuccess
  );

  useEffect(() => {
    if (!saveToNearSocial || !nearSocialProfile) {
      return;
    }

    const dirtyFields = form.formState.dirtyFields;

    if (!dirtyFields.displayName && nearSocialProfile.name) {
      form.setValue("displayName", nearSocialProfile.name, {
        shouldDirty: false,
      });
    }

    if (!dirtyFields.delegateStatement && nearSocialProfile.statement) {
      form.setValue("delegateStatement", nearSocialProfile.statement, {
        shouldDirty: false,
      });
    }

    if (
      !dirtyFields.agreeCodeConduct &&
      nearSocialProfile.codeOfConductSigned === "Signed"
    ) {
      form.setValue("agreeCodeConduct", true, { shouldDirty: false });
    }

    const onChainTopIssues = Array.isArray(nearSocialProfile.topIssues)
      ? nearSocialProfile.topIssues.filter((issue) => issue.value)
      : [];

    if (!dirtyFields.topIssues && onChainTopIssues.length > 0) {
      const currentTopIssues = form.getValues("topIssues");
      if (currentTopIssues.length > 0) {
        const byType = new Map(
          onChainTopIssues.map((issue) => [issue.type, issue.value])
        );
        const merged = currentTopIssues.map((issue) => ({
          ...issue,
          value: byType.get(issue.type) ?? issue.value ?? "",
        }));
        form.setValue("topIssues", merged, { shouldDirty: false });
      }
    }
  }, [saveToNearSocial, nearSocialProfile, form]);

  async function onSubmit(values: DelegateStatementFormValues) {
    if (!agreeCodeConduct) {
      return;
    }
    if (!signedAccountId) {
      throw new Error("signer not available");
    }

    values.topIssues = values.topIssues.filter((issue) => issue.value !== "");

    const {
      discord,
      delegateStatement,
      displayName,
      email,
      twitter,
      warpcast,
      topIssues,
      notificationPreferences,
    } = values;

    // User will only sign what they are seeing on the frontend
    const body = {
      address: signedAccountId,
      twitter: sanitizeString(twitter),
      discord: sanitizeString(discord),
      email: sanitizeString(email),
      warpcast: sanitizeString(warpcast),
      statement: sanitizeString(delegateStatement),
      topIssues: topIssues.map((issue) => ({
        type: sanitizeString(issue.type),
        value: sanitizeString(issue.value),
      })),
      notificationPreferences,
      agreeCodeConduct: values.agreeCodeConduct,
    };

    const serializedBody = JSON.stringify(body, undefined, "\t");

    if (saveToNearSocial) {
      const dirtyFields = form.formState.dirtyFields;
      const includeAllFields = !nearSocialProfile || !form.formState.isDirty;
      const trimmedName = sanitizeString(displayName ?? "");
      const trimmedStatement = sanitizeString(delegateStatement);

      const sanitizedTopIssues = hasTopIssues
        ? topIssues
            .map((issue) => ({
              type: sanitizeString(issue.type),
              value: sanitizeString(issue.value),
            }))
            .filter((issue) => issue.type && issue.value)
        : undefined;

      const includeDisplayName = includeAllFields
        ? trimmedName.length > 0
        : Boolean(dirtyFields.displayName);
      const includeStatement = includeAllFields
        ? trimmedStatement.length > 0
        : Boolean(dirtyFields.delegateStatement);
      const includeTopIssues = includeAllFields
        ? Boolean(sanitizedTopIssues && sanitizedTopIssues.length > 0)
        : Boolean(dirtyFields.topIssues);
      const includeCodeOfConduct = includeAllFields
        ? values.agreeCodeConduct
        : Boolean(dirtyFields.agreeCodeConduct);

      // Store as JSON string so Near Social preserves the array structure
      const topIssuesJson =
        includeTopIssues && hasTopIssues
          ? sanitizedTopIssues && sanitizedTopIssues.length > 0
            ? JSON.stringify(sanitizedTopIssues)
            : null
          : undefined;

      const nearSocialPayload = {
        ...(includeDisplayName
          ? { name: trimmedName ? trimmedName : null }
          : {}),
        ...(includeStatement
          ? { statement: trimmedStatement ? trimmedStatement : null }
          : {}),
        ...(topIssuesJson !== undefined ? { topIssues: topIssuesJson } : {}),
        ...(includeCodeOfConduct && values.agreeCodeConduct
          ? { codeOfConductSigned: "Signed" as const }
          : {}),
      };

      // Validate payload size to prevent oversized on-chain storage
      const sizeValidation = validatePayloadSize(
        nearSocialPayload,
        DELEGATE_PROFILE_LIMITS.nearSocialMaxBytes
      );
      if (!sizeValidation.isValid) {
        const sizeKb = Math.round(sizeValidation.size / 1000);
        const maxKb = Math.round(sizeValidation.maxBytes / 1000);
        setSubmissionError(
          `Profile data is too large for on-chain storage (${sizeKb}KB / ${maxKb}KB max). Please shorten your delegate statement or reduce the number of issues.`
        );
        return;
      }

      try {
        await writeNearSocial.mutateAsync(nearSocialPayload);
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Saved to Near Social</span>
          </div>
        );
        trackMixpanelEvent({
          event_name: MixpanelEvents.SavedNearSocialProfile,
          event_data: { address: signedAccountId },
        });
        setNearSocialSaveSuccess(true);
        router.push(`/delegates/${signedAccountId}`);
        return;
      } catch (error) {
        console.error("Near Social save failed:", error);
        setSubmissionError(
          "Failed to save to Near Social. You can retry or uncheck the option to save off-chain instead."
        );
        return;
      }
    }

    let signature;
    try {
      signature = await signMessage({ message: serializedBody });
    } catch (error) {
      console.error(error);
      setSubmissionError("Signature failed, please try again");
      return;
    }

    if (!signature) {
      setSubmissionError("Signature failed, please try again");
      return;
    }

    let response;
    try {
      response = await createDelegateStatement(
        {
          data: body,
          message: serializedBody,
          signature: signature.signature,
          publicKey: signature.publicKey,
        },
        networkId
      );
    } catch (error) {
      console.error(error);
      setSubmissionError(
        "There was an error submitting your form, please try again"
      );
      return;
    }

    if (!response) {
      setSubmissionError(
        "There was an error submitting your form, please try again"
      );
      return;
    }

    trackMixpanelEvent({
      event_name: MixpanelEvents.CreatedDelegateStatement,
      event_data: { address: signedAccountId },
    });
    trackDelegateStatementSaved({
      statement_length_chars: delegateStatement.length,
      has_twitter: !!twitter,
      has_discord: !!discord,
      topics_selected_count: topIssues.length,
      is_edit: !!delegate,
    });
    setSaveSuccess(true);

    router.push(`/delegates/${signedAccountId}`);
  }

  const canSubmit =
    !!signedAccountId &&
    !form.formState.isSubmitting &&
    !writeNearSocial.isPending &&
    !!form.formState.isValid &&
    !!agreeCodeConduct;

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-16 justify-between mt-12 w-full max-w-full">
      {delegate && (
        <div className="flex flex-col static sm:sticky top-16 shrink-0 w-full sm:max-w-[350px]">
          <DelegateProfile
            isEditMode
            profile={{
              address: delegate.address ?? "",
              statement: delegate.statement ?? "",
              twitter: delegate.twitter,
              discord: delegate.discord,
              warpcast: delegate.warpcast,
            }}
          />
        </div>
      )}
      <div className="flex flex-col w-full">
        <div className="flex flex-col bg-neutral border rounded-xl border-line shadow-newDefault">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-1 py-4 px-6 border-b border-line">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="saveToNearSocial"
                    checked={saveToNearSocial}
                    onCheckedChange={(checked) => {
                      const nextValue = checked === true;
                      if (nextValue) {
                        offChainSnapshotRef.current = form.getValues();
                      }
                      setSaveToNearSocial(nextValue);
                      if (!nextValue) {
                        if (offChainSnapshotRef.current) {
                          form.reset(offChainSnapshotRef.current);
                        } else {
                          onResetToOffChain?.();
                        }
                      }
                    }}
                  />
                  <label
                    htmlFor="saveToNearSocial"
                    className="text-sm text-secondary cursor-pointer"
                  >
                    Save profile to the on-chain Near Social contract
                  </label>
                </div>
              </div>

              <DelegateStatementFormSection
                form={form}
                showDisplayName={saveToNearSocial}
              />
              {hasTopIssues && <TopIssuesFormSection form={form} />}

              <OtherInfoFormSection
                form={form}
                hideOffChainFields={saveToNearSocial}
              />

              <div className="flex flex-col sm:flex-row justify-end sm:justify-between items-stretch sm:items-center gap-4 py-8 px-6 flex-wrap">
                <span className="text-sm text-primary">
                  Tip: you can always come back and edit your profile at any
                  time.
                </span>

                <Button
                  variant="elevatedOutline"
                  className="py-3 px-4 text-primary"
                  disabled={!canSubmit}
                  type="submit"
                >
                  Submit delegate profile
                </Button>
                {form.formState.isSubmitted && !agreeCodeConduct && (
                  <span className="text-red-700 text-sm">
                    You must agree with the code of conduct to continue
                  </span>
                )}
                {submissionError && (
                  <span className="text-red-700 text-sm">
                    {submissionError}
                  </span>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
