import { DialogDefinitions } from "./types";
import { DelegateDialog } from "../DelegateDialog/DelegateDialog";
import { UndelegateDialog } from "../UndelegateDialog/UndelegateDialog";
import { NearVoteDialog } from "../VoteDialog";
import { ProposalInfo, VotingConfig } from "@/lib/contracts/types/voting";
import { VoteOptionsDialog } from "../VoteOptionsDialog";
import { ProposalModal } from "@/components/Proposals/Proposals/ProposalModal";
import { LockDialogSource, NearLockDialog } from "../LockDialog/index";
import { StakingDialog, StakingSource } from "../StakingDialog/StakingDialog";
import { VotingPowerProjectionsDialog } from "../VotingPowerProjectionsDialog";
import { UnlockDialog } from "../UnlockDialog";
import { EncourageConnectWalletDialog } from "@/components/Delegates/Delegations/EncourageConnectWalletDialog";
import SubscribeDialog from "@/components/Notifications/SubscribeDialog";
import { ConfirmDialog } from "../ConfirmDialog/ConfirmDialog";
import { UnstakeDialog } from "../UnstakeDialog";
// NearClaimDialog removed in phase 2
import { trackEvent } from "@/lib/analytics";

export type DialogType =
  | DelegateDialogType
  | UndelegateDialogType
  | NearProposalDialogType
  | NearVoteDialogType
  | VoteOptionsDialogType
  | NearLockDialogType
  | StakingDialogType
  | VotingPowerProjectionsDialogType
  | UnlockDialogType
  | EncourageConnectWalletDialogType
  | SubscribeDialogType
  | ConfirmDialogType
  | NearUnstakeDialogType;

export type DelegateDialogType = {
  type: "NEAR_DELEGATE";
  params: {
    delegateAddress: string;
  };
};

export type UndelegateDialogType = {
  type: "NEAR_UNDELEGATE";
  params: {
    delegateAddress: string;
  };
};

export type NearProposalDialogType = {
  type: "NEAR_PROPOSAL";
  params: Record<string, never>;
};

export type NearLockDialogType = {
  type: "NEAR_LOCK";
  className?: string;
  params: {
    source: LockDialogSource;
    preSelectedTokenId?: string;
    customStakingPoolId?: string;
  };
};

export type StakingDialogType = {
  type: "NEAR_STAKING";
  className?: string;
  params: {
    prefilledAmount?: string;
    source: StakingSource;
    customStakingPoolId?: string;
  };
};

export type NearVoteDialogType = {
  type: "NEAR_VOTE";
  params: {
    proposal: ProposalInfo;
    config: VotingConfig;
    preSelectedVote?: number;
    onSuccess?: () => void;
  };
};

export type VoteOptionsDialogType = {
  type: "NEAR_VOTE_OPTIONS";
  params: {
    proposal: ProposalInfo;
    config: VotingConfig;
  };
};

export type VotingPowerProjectionsDialogType = {
  type: "VOTING_POWER_PROJECTIONS";
  className?: string;
  params: {
    votingPower: string;
  };
};

export type UnlockDialogType = {
  type: "NEAR_UNLOCK";
  params: Record<string, never>;
};

export type EncourageConnectWalletDialogType = {
  type: "ENCOURAGE_CONNECT_WALLET";
  params: Record<string, never>;
};

export type SubscribeDialogType = {
  type: "NEAR_SUBSCRIBE";
  params: { type: "root" | "vote" };
};

export type ConfirmDialogType = {
  type: "CONFIRM";
  params: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "default";
    onConfirm: () => void;
  };
};

export type NearUnstakeDialogType = {
  type: "NEAR_UNSTAKE";
  params: Record<string, never>;
};

export const dialogs: DialogDefinitions<DialogType> = {
  NEAR_DELEGATE: ({ delegateAddress }, closeDialog, registerOnDismiss) => {
    const startTime = Date.now();
    registerOnDismiss?.(() => {
      trackEvent({
        event_name: "Delegation Dialog Closed",
        event_data: {
          step_abandoned: "delegate_confirmation",
          time_in_flow_ms: Date.now() - startTime,
        },
      });
    });
    return (
      <DelegateDialog
        delegateAddress={delegateAddress}
        closeDialog={closeDialog}
      />
    );
  },
  NEAR_UNDELEGATE: ({ delegateAddress }, closeDialog, registerOnDismiss) => {
    const startTime = Date.now();
    registerOnDismiss?.(() => {
      trackEvent({
        event_name: "Undelegation Dialog Closed",
        event_data: {
          step_abandoned: "undelegate_confirmation",
          time_in_flow_ms: Date.now() - startTime,
        },
      });
    });
    return (
      <UndelegateDialog
        delegateAddress={delegateAddress}
        closeDialog={closeDialog}
      />
    );
  },
  NEAR_PROPOSAL: () => {
    return <ProposalModal />;
  },
  NEAR_LOCK: (params, closeDialog) => {
    return <NearLockDialog closeDialog={closeDialog} {...params} />;
  },
  NEAR_VOTE: (
    { proposal, config, preSelectedVote, onSuccess },
    closeDialog
  ) => (
    <NearVoteDialog
      proposal={proposal}
      config={config}
      preSelectedVote={preSelectedVote}
      closeDialog={closeDialog}
      onSuccess={onSuccess}
    />
  ),
  NEAR_VOTE_OPTIONS: ({ proposal, config }, closeDialog) => (
    <VoteOptionsDialog
      proposal={proposal}
      config={config}
      closeDialog={closeDialog}
    />
  ),
  NEAR_STAKING: (params, closeDialog, registerOnDismiss) => {
    const startTime = Date.now();
    const stepRef = { current: "pool_selection" };
    registerOnDismiss?.(() => {
      trackEvent({
        event_name: "Staking Dialog Closed",
        event_data: {
          step_abandoned: stepRef.current,
          time_in_flow_ms: Date.now() - startTime,
        },
      });
    });
    return (
      <StakingDialog
        closeDialog={closeDialog}
        {...params}
        onStepChange={(step: string) => {
          stepRef.current = step;
        }}
      />
    );
  },
  VOTING_POWER_PROJECTIONS: ({ votingPower }, closeDialog) => {
    return (
      <VotingPowerProjectionsDialog
        closeDialog={closeDialog}
        votingPower={votingPower}
      />
    );
  },
  NEAR_UNLOCK: (_, closeDialog) => {
    return <UnlockDialog closeDialog={closeDialog} />;
  },
  ENCOURAGE_CONNECT_WALLET: (_, closeDialog) => (
    <EncourageConnectWalletDialog closeDialog={closeDialog} />
  ),
  NEAR_SUBSCRIBE: ({ type }, closeDialog) => {
    return <SubscribeDialog closeDialog={closeDialog} type={type} />;
  },
  CONFIRM: (params, closeDialog) => (
    <ConfirmDialog {...params} closeDialog={closeDialog} />
  ),
  NEAR_UNSTAKE: (_, closeDialog) => <UnstakeDialog closeDialog={closeDialog} />,

};
