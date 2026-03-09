"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { VStack, HStack } from "@/components/Layout/Stack";
import { Tab } from "@headlessui/react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPROVAL_THRESHOLD_BASIS_POINTS,
  ProposalMetadata,
  ProposalType,
  encodeMetadata,
} from "@/lib/proposalMetadata";
import Markdown from "@/components/shared/Markdown/Markdown";
import { InputBox } from "@/components/shared/InputBox";
import { DraftProposal } from "@/lib/api/proposal/types";
import { useUpdateDraftProposal } from "@/hooks/useDraftProposals";
import { toast } from "react-hot-toast";
import {
  DEFAULT_QUORUM_THRESHOLD_PERCENTAGE_BPS,
  NEAR_VOTING_OPTIONS,
} from "@/lib/constants";
import Link from "next/link";
import { Controller, useFormContext } from "react-hook-form";
import LinkPreview from "@/components/shared/LinkPreview";
import TokenAmount from "@/components/shared/TokenAmount";
import Big from "big.js";
import { VotingConfig } from "@/lib/contracts/types/voting";
import { FormValues } from "./DraftProposalPage";

const errorTextStyle = "text-sm text-negative mt-1";

type DisplayMode = "write" | "preview";

const displayModeSelectorStyles =
  "cursor-pointer text-sm font-medium text-tertiary py-1 px-3 rounded-full hover:bg-wash hover:text-primary";

const displayModeSelectorSelectedStyles = "bg-wash text-primary rounded-full";

interface DraftEditFormProps {
  draft: DraftProposal;
  config: VotingConfig;
  votingDuration: string;
  onSaveSuccess?: () => void;
}

export interface DraftEditFormRef {
  handleSave: () => Promise<void>;
  isDirty: boolean;
  isValid: boolean;
  isSaving: boolean;
}

function DraftDetailsForm() {
  const {
    watch,
    formState: { errors },
    control,
  } = useFormContext<FormValues>();

  const descriptionValue = watch("description");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("write");

  return (
    <VStack className="mt-4">
      <div className="flex flex-col gap-4">
        <h4 className="text-xs font-semibold mb-1 text-secondary">Title</h4>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <InputBox
              placeholder={"I'd like to propose..."}
              error={!!errors.title}
              {...field}
            />
          )}
        />
        {errors.title && (
          <p className={errorTextStyle}>{errors.title.message}</p>
        )}

        <HStack
          alignItems="items-baseline"
          justifyContent="justify-between"
          gap={4}
        >
          <div className="flex flex-col gap-1">
            <h4 className="text-xs font-semibold text-secondary">Content</h4>
            <Tab.Group
              manual
              selectedIndex={(() => {
                switch (displayMode) {
                  case "preview":
                    return 1;
                  case "write":
                    return 0;
                }
              })()}
              onChange={(index) => {
                switch (index) {
                  case 0:
                    setDisplayMode("write");
                    return;
                  case 1:
                    setDisplayMode("preview");
                    return;
                }
              }}
            >
              <Tab.List>
                <HStack gap={1}>
                  <Tab className="outline-none">
                    {({ selected }) => (
                      <div
                        className={`
                        ${displayModeSelectorStyles}${" "}
                        ${selected && displayModeSelectorSelectedStyles}
                      `}
                      >
                        Write
                      </div>
                    )}
                  </Tab>

                  <Tab className="outline-none">
                    {({ selected }) => (
                      <div
                        className={`
                        ${displayModeSelectorStyles}${" "}
                        ${selected && displayModeSelectorSelectedStyles}
                      `}
                      >
                        Preview
                      </div>
                    )}
                  </Tab>
                </HStack>
              </Tab.List>
            </Tab.Group>
          </div>
        </HStack>

        {displayMode === "write" && (
          <>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <textarea
                  className={`text-tertiary p-4 rounded-md outline-none w-full min-h-[16rem] border ${errors.description ? "border-negative" : "border-line"}`}
                  placeholder="I'm a proposal body, and I like markdown formatting..."
                  {...field}
                />
              )}
            />
            {errors.description && (
              <p className={errorTextStyle}>{errors.description.message}</p>
            )}
          </>
        )}

        {displayMode === "preview" && (
          <Markdown content={descriptionValue || "*No description provided*"} />
        )}

        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold mb-1 text-secondary">Link</h4>
          <Link
            href="/info?item=proposal-process"
            target="_blank"
            className="text-xs text-primary hover:text-secondary underline flex items-center gap-1"
          >
            Optional for drafts, required on submission{" "}
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </Link>
        </div>
        <Controller
          control={control}
          name="link"
          render={({ field }) => (
            <InputBox
              placeholder={"https://gov.near.org/your-proposal"}
              error={!!errors.link}
              disabled={displayMode === "preview"}
              {...field}
            />
          )}
        />
        <LinkPreview url={watch("link") || ""} />
        {errors.link && (
          <div className={errorTextStyle}>
            {errors.link.message}
            {errors.link.message?.includes("https://gov.near.org/") && (
              <div className="mt-1">
                <Link
                  href="/info?item=proposal-process"
                  target="_blank"
                  className="text-primary hover:text-secondary underline flex items-center gap-1"
                >
                  Learn more <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col gap-4 border-t border-line pt-4 mt-2">
          <h4 className="text-xs font-semibold text-secondary">
            Configuration
          </h4>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-tertiary mb-1 block">
                Proposal Type
              </label>
              <Controller
                control={control}
                name="proposalType"
                rules={{ required: "Proposal type is required" }}
                render={({ field }) => (
                  <>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={displayMode === "preview"}
                    >
                      <SelectTrigger
                        className={`w-full bg-white ${errors.proposalType ? "border-negative" : ""}`}
                      >
                        <SelectValue placeholder="Select a proposal type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ProposalType.SimpleMajority}>
                          Simple Majority
                        </SelectItem>
                        <SelectItem value={ProposalType.SuperMajority}>
                          Super Majority
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.proposalType && (
                      <p className={errorTextStyle}>
                        {errors.proposalType.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </VStack>
  );
}

const DraftEditForm = forwardRef<DraftEditFormRef, DraftEditFormProps>(
  ({ draft, config, votingDuration, onSaveSuccess }, ref) => {
    const { mutate: updateDraft, isPending: isUpdating } =
      useUpdateDraftProposal();
    const totalDeposit = Big(config.base_proposal_fee)
      .plus(Big(config.vote_storage_fee))
      .toFixed();

    const {
      handleSubmit,
      formState: { isValid, isDirty },
    } = useFormContext<FormValues>();

    const handleSave = async () => {
      if (!isDirty) return;

      handleSubmit(
        (formValues) => {
          if (!formValues.proposalType) {
            toast.error("Please select a proposal type before saving");
            return;
          }

          let metadata: ProposalMetadata = {
            version: 1,
            quorum: DEFAULT_QUORUM_THRESHOLD_PERCENTAGE_BPS,
            approvalThreshold: APPROVAL_THRESHOLD_BASIS_POINTS.SIMPLE_MAJORITY,
            proposalType: ProposalType.SimpleMajority,
          };

          if (formValues.proposalType === ProposalType.SuperMajority) {
            metadata = {
              version: 1,
              quorum: DEFAULT_QUORUM_THRESHOLD_PERCENTAGE_BPS,
              approvalThreshold: APPROVAL_THRESHOLD_BASIS_POINTS.SUPER_MAJORITY,
              proposalType: ProposalType.SuperMajority,
            };
          }

          updateDraft(
            {
              id: draft.id,
              data: {
                title: formValues.title.trim(),
                description: encodeMetadata(
                  formValues.description.trim(),
                  metadata
                ),
                proposalUrl: formValues.link?.trim() || undefined,
                votingOptions: { options: NEAR_VOTING_OPTIONS },
              },
            },
            {
              onSuccess: () => {
                toast.success("Draft saved");
                onSaveSuccess?.();
              },
              onError: (error) => {
                toast.error("Failed to save draft");
                console.error(error);
              },
            }
          );
        },
        // Do not block draft saves due to validation errors; allow partial drafts
        undefined
      )();
    };

    useImperativeHandle(ref, () => ({
      handleSave,
      isDirty,
      isValid,
      isSaving: isUpdating,
    }));

    return (
      <HStack
        justifyContent="justify-between"
        gap={16}
        className="w-full flex flex-col-reverse items-center lg:flex-row lg:items-start"
      >
        <VStack className="w-full">
          <VStack className="bg-neutral rounded-xl border border-line shadow-newDefault">
            <div className="p-8 border-b border-line">
              <DraftDetailsForm />
            </div>
          </VStack>
        </VStack>

        <div className="shrink-0 w-full lg:w-[24rem]">
          <div className="bg-wash rounded-xl border border-line p-6">
            <h2 className="text-2xl font-extrabold mb-4 text-primary">
              Proposal Guide
            </h2>
            <ul className="text-sm text-muted-foreground list-disc pl-4 space-y-2">
              <li>
                Proposals must adhere to the style guide and be approved by the
                Screening Committee.
              </li>
              <li>
                All created proposals will have three voting options: For,
                Against, and Abstain.
              </li>
              <li>Once approved, voting will be open for {votingDuration}.</li>
              <li>
                Creating a proposal requires a minimum deposit of{" "}
                <TokenAmount amount={totalDeposit} minimumFractionDigits={2} />.
              </li>
            </ul>
          </div>
        </div>
      </HStack>
    );
  }
);

DraftEditForm.displayName = "DraftEditForm";

export default DraftEditForm;
