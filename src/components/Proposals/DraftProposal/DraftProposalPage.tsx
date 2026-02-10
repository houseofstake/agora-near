"use client";

import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { HStack, VStack } from "@/components/Layout/Stack";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Markdown from "@/components/shared/Markdown/Markdown";
import { Button } from "@/components/ui/button";
import { useNear } from "@/contexts/NearContext";
import { useCreateProposal } from "@/hooks/useCreateProposal";
import {
  useDeleteDraftProposal,
  useDraftProposal,
  useUpdateDraftProposalStage,
} from "@/hooks/useDraftProposals";
import { useProposalConfig } from "@/hooks/useProposalConfig";
import { DraftProposalStage } from "@/lib/api/proposal/types";
import {
  DEFAULT_QUORUM_THRESHOLD_PERCENTAGE_BPS,
  NEAR_VOTING_OPTIONS,
} from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeftIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import CopyableHumanAddress from "@/components/shared/CopyableHumanAddress";
import DraftEditForm, { DraftEditFormRef } from "./DraftEditForm";
import {
  APPROVAL_THRESHOLD_BASIS_POINTS,
  decodeMetadata,
  encodeMetadata,
  ProposalMetadata,
  ProposalType,
} from "@/lib/proposalMetadata";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  // Allow saving drafts without enforcing link validation
  link: z.string().optional().or(z.literal("")),
  options: z
    .array(
      z.object({
        title: z.string().min(1, "Option title is required"),
      })
    )
    .min(2, "At least two options are required"),
  proposalType: z.nativeEnum(ProposalType).optional(),
  quorumThreshold: z.coerce.number().optional(),
  approvalThreshold: z.coerce.number().optional(),
});

// Strict validation used only on submission
const submitSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  link: z
    .string()
    .min(1, "Link is required")
    .url("Must be a valid URL")
    .refine(
      (url) =>
        url.startsWith("https://gov.near.org/") ||
        url.startsWith("https://github.com/houseofstake/proposals/"),
      {
        message:
          "Proposal links must be from https://gov.near.org/ or https://github.com/houseofstake/proposals/. Create a forum post or PR first to gather community support.",
      }
    ),
  options: z
    .array(
      z.object({
        title: z.string().min(1, "Option title is required"),
      })
    )
    .min(2, "At least two options are required"),
  proposalType: z.nativeEnum(ProposalType),
  quorumThreshold: z.coerce.number().optional(),
  approvalThreshold: z.coerce.number().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

type DraftProposalPageProps = {
  draftId: string;
};

function ScreeningCommitteePanel({
  reviewerIds,
  votingDuration,
}: {
  reviewerIds: string[];
  votingDuration: string;
}) {
  return (
    <div className="bg-wash rounded-xl border border-line p-6">
      <h2 className="text-2xl font-extrabold mb-4 text-primary">
        Approval Request
      </h2>
      <p className="text-sm text-secondary mb-4">
        Submitting your proposal will send it to the Screening Committee for
        review. Any committee member can approve it. Once approved, your
        proposal will go live for {votingDuration}.
      </p>

      <h3 className="text-lg font-semibold mb-3 text-primary border-t pt-4">
        Screening Committee Members
      </h3>
      <div className="space-y-2">
        {reviewerIds.map((reviewerId) => (
          <div key={reviewerId} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-secondary">
                {reviewerId.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <CopyableHumanAddress
              address={reviewerId}
              strategy="middle"
              className="text-sm"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const DraftProposalsPageContent = memo(
  ({ draftId }: DraftProposalPageProps) => {
    const router = useRouter();
    const { signedAccountId } = useNear();
    const {
      config,
      votingDuration,
      isLoading: configLoading,
    } = useProposalConfig();
    const openDialog = useOpenDialog();
    const draftFormRef = useRef<DraftEditFormRef>(null);
    const {
      data: draft,
      isLoading: draftLoading,
      error,
    } = useDraftProposal(draftId);
    const { mutate: updateDraft, isPending: isUpdating } =
      useUpdateDraftProposalStage();
    const { mutate: deleteDraft, isPending: isDeleting } =
      useDeleteDraftProposal();

    const [step, setStep] = useState<1 | 2>(1);

    const {
      formState: { isDirty, isValid },
      reset,
      handleSubmit: handleSubmitForm,
      watch,
      setError,
      getValues,
    } = useFormContext<FormValues>();

    const [title, description, link] = watch(["title", "description", "link"]);

    const { createProposalAsync, isCreatingProposal, createProposalError } =
      useCreateProposal({
        baseFee: config?.base_proposal_fee || "0",
        storageFee: config?.vote_storage_fee || "0",
      });

    const isLoading = draftLoading || configLoading;

    const handleSubmit = useCallback(() => {
      handleSubmitForm(
        async ({ title, description, link, proposalType }) => {
          if (step === 1) {
            setStep(2);
            updateDraft({
              id: draftId,
              data: {
                stage: DraftProposalStage.AWAITING_SUBMISSION,
              },
            });
            return;
          }

          // Enforce strict validation only at submission time
          const submitValidation = submitSchema.safeParse({
            title,
            description,
            link,
            proposalType,
            options: NEAR_VOTING_OPTIONS.map((title) => ({ title })),
          });

          if (!submitValidation.success) {
            const message =
              submitValidation.error.issues[0]?.message || "Invalid submission";
            // Surface the error on the link field and return to the editable step
            setError("link", { type: "manual", message });
            toast.error(message);
            setStep(1);
            return;
          }

          try {
            const metadata: ProposalMetadata = {
              version: 1,
              quorum: DEFAULT_QUORUM_THRESHOLD_PERCENTAGE_BPS,
              approvalThreshold:
                proposalType === ProposalType.SuperMajority
                  ? APPROVAL_THRESHOLD_BASIS_POINTS.SUPER_MAJORITY
                  : APPROVAL_THRESHOLD_BASIS_POINTS.SIMPLE_MAJORITY,
              proposalType:
                proposalType === ProposalType.SuperMajority
                  ? ProposalType.SuperMajority
                  : ProposalType.SimpleMajority,
            };

            const encodedDescription = encodeMetadata(description, metadata);

            const transactionResult = await createProposalAsync({
              title: title || null,
              description: encodedDescription || null,
              link: link || null,
              voting_options: NEAR_VOTING_OPTIONS,
            });

            const receiptId = transactionResult?.[0]?.transaction?.hash || null;

            updateDraft({
              id: draftId,
              data: {
                stage: DraftProposalStage.SUBMITTED,
                receiptId,
              },
            });

            toast.success("Proposal submitted successfully");
            router.replace("/proposals");
          } catch (error) {
            console.error("Failed to submit proposal:", error);
          }
        },
        (errors) => {
          console.log("Form errors:", JSON.stringify(errors, null, 2));
        }
      )();
    }, [
      createProposalAsync,
      draftId,
      handleSubmitForm,
      router,
      setError,
      step,
      updateDraft,
    ]);

    useEffect(() => {
      if (draft && !isDirty) {
        const { description: cleanDescription, metadata } = decodeMetadata(
          draft.description || ""
        );

        reset({
          title: draft.title || "",
          description: cleanDescription,
          link: draft.proposalUrl || "",
          proposalType: metadata.proposalType,
          options: NEAR_VOTING_OPTIONS.map((title) => ({ title })),
        });
      }
    }, [draft, reset, isDirty]);

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold text-primary mb-2">
            Draft Not Found
          </h1>
          <p className="text-secondary mb-4">
            The draft proposal you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      );
    }

    if (!draft || !config) {
      return null;
    }

    if (draft.author !== signedAccountId) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold text-primary mb-2">
            Access Denied
          </h1>
          <p className="text-secondary mb-4">
            You can only view your own draft proposals.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      );
    }

    const handleDelete = () => {
      openDialog({
        type: "CONFIRM",
        params: {
          title: "Delete Draft",
          message:
            "Are you sure you want to delete this draft? This action cannot be undone.",
          confirmText: "Delete",
          cancelText: "Cancel",
          variant: "danger" as const,
          onConfirm: () => {
            deleteDraft(draftId, {
              onSuccess: () => {
                toast.success("Draft deleted");
                router.push("/");
              },
              onError: (error: any) => {
                toast.error("Failed to delete draft");
                console.error(error);
              },
            });
          },
        },
      });
    };

    const stepText = step === 1 ? "Step 1/2" : "Step 2/2";
    const buttonText =
      step === 1
        ? "Continue to Review"
        : isCreatingProposal
          ? "Submitting..."
          : "Submit for Approval";

    const isEmptyDraft = !draft.title && !draft.description;

    return (
      <div className="max-w-[76rem] mx-auto mt-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                step === 1 ? router.push("/proposals") : setStep(1)
              }
              className="flex items-center justify-center p-0 h-8 w-8 rounded-full"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <div className="flex gap-4 items-center">
              <h1 className="text-2xl font-bold text-primary">
                {step === 1
                  ? isEmptyDraft
                    ? "Create Proposal"
                    : "Edit Proposal"
                  : "Submit Proposal"}
              </h1>
              <span className="text-sm text-muted-foreground">{stepText}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step === 1 && (
              <>
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="hover:text-red-700 hover:bg-red-50 hover:border-red-300 border-0 hover:border"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => draftFormRef.current?.handleSave()}
                  variant="outline"
                  className="rounded-full"
                  disabled={!isDirty || isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="rounded-full"
                  disabled={isUpdating}
                >
                  {buttonText}
                </Button>
              </>
            )}
            {step === 2 && (
              <Button
                onClick={handleSubmit}
                disabled={isCreatingProposal || isUpdating || !isValid}
                className="rounded-full"
              >
                {buttonText}
              </Button>
            )}
          </div>
        </div>

        {step === 1 ? (
          <DraftEditForm
            ref={draftFormRef}
            draft={draft}
            config={config}
            votingDuration={votingDuration}
            onSaveSuccess={() => {
              const currentValues = getValues();
              reset(currentValues);
            }}
          />
        ) : (
          <HStack
            justifyContent="justify-between"
            gap={16}
            className="w-full flex flex-col-reverse items-center lg:flex-row lg:items-start"
          >
            <VStack className="w-full">
              <div className="bg-neutral rounded-xl border border-line shadow-newDefault">
                <div className="p-8 border-b border-line">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-primary mb-2">
                        {title || "Untitled Proposal"}
                      </h2>
                      <p className="text-sm text-secondary">
                        <span className="font-semibold">Submitted by:</span>{" "}
                        {signedAccountId}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border rounded-lg p-4">
                    {draft.proposalUrl && (
                      <div className="flex items-center gap-2 border rounded-lg p-4 bg-wash">
                        <h4 className="text-sm font-semibold text-secondary">
                          Forum Link:
                        </h4>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-secondary underline text-sm"
                        >
                          {link}
                        </a>
                      </div>
                    )}

                    <div className="prose prose-sm max-w-none">
                      <Markdown
                        content={description || "*No description provided*"}
                      />
                    </div>
                  </div>
                </div>
                {createProposalError && (
                  <div className="p-8">
                    <p className="text-negative text-sm break-words mt-2">
                      {createProposalError?.message}
                    </p>
                  </div>
                )}
                {!isValid && (
                  <div className="p-8">
                    <p className="text-negative text-sm break-words mt-2">
                      Please ensure all proposal details are filled out before
                      submitting.
                    </p>
                  </div>
                )}
              </div>
            </VStack>

            <div className="shrink-0 w-full lg:w-[24rem]">
              <ScreeningCommitteePanel
                reviewerIds={config.reviewer_ids}
                votingDuration={votingDuration}
              />
            </div>
          </HStack>
        )}
      </div>
    );
  }
);

DraftProposalsPageContent.displayName = "DraftProposalsPageContent";

export default function DraftProposalPage({ draftId }: DraftProposalPageProps) {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      link: "",
      options: NEAR_VOTING_OPTIONS.map((title) => ({ title })),
      proposalType: undefined,
      quorumThreshold: undefined,
      approvalThreshold: undefined,
    },
    mode: "onSubmit",
  });

  return (
    <FormProvider {...methods}>
      <DraftProposalsPageContent draftId={draftId} />
    </FormProvider>
  );
}
