import { trackEvent, identifyUser, clearIdentity } from "@/lib/analytics";

const trackWalletSelectorOpened = (source: string) => {
  trackEvent({
    event_name: "Wallet Selector Opened",
    event_data: { source },
  });
};

const trackWalletSelected = (walletType: string) => {
  trackEvent({
    event_name: "Wallet Selected",
    event_data: { wallet_type: walletType },
  });
};

const trackWalletConnected = (
  walletType: string,
  walletAddress: string,
  isFireblocks: boolean
) => {
  identifyUser(walletAddress, {
    wallet_type: walletType,
    is_fireblocks: isFireblocks,
  });
  trackEvent({
    event_name: "Wallet Connected",
    event_data: {
      wallet_type: walletType,
      wallet_address: walletAddress,
      is_fireblocks: isFireblocks,
    },
  });
};

const trackWalletConnectionFailed = (
  walletType: string,
  errorType: string,
  errorMessage: string
) => {
  trackEvent({
    event_name: "Wallet Connection Failed",
    event_data: {
      wallet_type: walletType,
      error_type: errorType,
      error_message: errorMessage,
    },
  });
};

const trackWalletDisconnected = (
  walletType: string,
  sessionDurationMs?: number
) => {
  trackEvent({
    event_name: "Wallet Disconnected",
    event_data: {
      wallet_type: walletType,
      session_duration_ms: sessionDurationMs,
    },
  });
  clearIdentity();
};

// --- veNEAR Locking Funnel ---

const trackLockingFlowStarted = (
  source: string,
  walletConnected: boolean,
  hasNearBalance: boolean
) => {
  trackEvent({
    event_name: "Locking Flow Started",
    event_data: {
      source,
      wallet_connected: walletConnected,
      has_near_balance: hasNearBalance,
    },
  });
};

const trackLockDialogOpened = (props: {
  source: string;
  user_near_balance_yocto: string;
  user_lst_balance_yocto: string;
  has_existing_lockup: boolean;
}) => {
  trackEvent({
    event_name: "Lock Dialog Opened",
    event_data: props,
  });
};

const trackLockAmountEntered = (props: {
  amount_near: number;
  lock_duration_days: number;
  lst_selected: string;
}) => {
  trackEvent({
    event_name: "Lock Amount Entered",
    event_data: props,
  });
};

const trackLockDurationSelected = (props: {
  duration_days: number;
  veNEAR_preview_amount: number;
}) => {
  trackEvent({
    event_name: "Lock Duration Selected",
    event_data: props,
  });
};

const trackLockReviewStepReached = (props: {
  amount_near: number;
  duration_days: number;
  lst_selected: string;
}) => {
  trackEvent({
    event_name: "Lock Review Step Reached",
    event_data: props,
  });
};

const trackLockTransactionInitiated = (props: {
  amount_near: number;
  duration_days: number;
  lst_selected: string;
}) => {
  trackEvent({
    event_name: "Lock Transaction Initiated",
    event_data: props,
  });
};

const trackLockTransactionSuccess = (props: {
  amount_near_yocto: string;
  duration_days: number;
  lst_selected: string;
  tx_hash: string;
  lockup_id?: string;
}) => {
  trackEvent({
    event_name: "Lock Transaction Success",
    event_data: props,
  });
};

const trackLockTransactionFailed = (props: {
  error_type: string;
  error_message: string;
}) => {
  trackEvent({
    event_name: "Lock Transaction Failed",
    event_data: props,
  });
};

const trackLockDialogClosed = (props: {
  step_abandoned: string;
  time_in_flow_ms: number;
}) => {
  trackEvent({
    event_name: "Lock Dialog Closed",
    event_data: props,
  });
};

// --- veNEAR Unlocking Funnel ---

const trackUnlockFlowStarted = (props: {
  lockup_id: string;
  locked_amount_yocto: string;
  lock_duration_remaining_days: number;
}) => {
  trackEvent({
    event_name: "Unlock Flow Started",
    event_data: props,
  });
};

const trackUnlockAmountEntered = (props: {
  unlock_amount_near: number;
  remaining_after_unlock: number;
}) => {
  trackEvent({
    event_name: "Unlock Amount Entered",
    event_data: props,
  });
};

const trackUnlockReviewReached = (props: {
  unlock_amount_near: number;
  unlock_period_days: number;
}) => {
  trackEvent({
    event_name: "Unlock Review Reached",
    event_data: props,
  });
};

const trackUnlockTransactionInitiated = (props: {
  unlock_amount_near: number;
  unlock_period_days: number;
}) => {
  trackEvent({
    event_name: "Unlock Transaction Initiated",
    event_data: props,
  });
};

const trackUnlockTransactionSuccess = (props: {
  unlock_amount_yocto: string;
  tx_hash: string;
}) => {
  trackEvent({
    event_name: "Unlock Transaction Success",
    event_data: props,
  });
};

const trackUnlockTransactionFailed = (props: {
  error_type: string;
  error_message: string;
}) => {
  trackEvent({
    event_name: "Unlock Transaction Failed",
    event_data: props,
  });
};

const trackUnlockDialogClosed = (props: {
  step_abandoned: string;
  time_in_flow_ms: number;
}) => {
  trackEvent({
    event_name: "Unlock Dialog Closed",
    event_data: props,
  });
};

// --- Voting Flow ---

const trackVoteDialogOpened = (props: {
  proposal_id: string;
  user_voting_power: string;
}) => {
  trackEvent({
    event_name: "Vote Dialog Opened",
    event_data: props,
  });
};

const trackVoteOptionSelected = (props: {
  proposal_id: string;
  vote_choice: string;
}) => {
  trackEvent({
    event_name: "Vote Option Selected",
    event_data: props,
  });
};

const trackVoteCast = (props: {
  proposal_id: string;
  vote_choice: string;
  voting_power_used: string;
  tx_hash: string;
}) => {
  trackEvent({
    event_name: "Vote Cast",
    event_data: props,
  });
};

const trackVoteFailed = (props: {
  proposal_id: string;
  error_type: string;
}) => {
  trackEvent({
    event_name: "Vote Failed",
    event_data: props,
  });
};

// --- Staking Flow (§2a) ---

const trackStakingFlowStarted = (props: {
  source: string;
  lockup_balance_near?: string;
}) => {
  trackEvent({ event_name: "Staking Flow Started", event_data: props });
};

const trackStakingPoolSelected = (props: {
  pool_type: string;
  pool_id: string;
  pool_apy?: number;
}) => {
  trackEvent({ event_name: "Staking Pool Selected", event_data: props });
};

const trackCustomPoolEntered = (props: {
  pool_id: string;
  is_whitelisted: boolean;
}) => {
  trackEvent({ event_name: "Custom Pool Entered", event_data: props });
};

const trackStakingAmountEntered = (props: {
  amount_near: number;
  pool_id: string;
}) => {
  trackEvent({ event_name: "Staking Amount Entered", event_data: props });
};

const trackStakingTransactionSuccess = (props: {
  amount_near_yocto: string;
  pool_id: string;
  pool_type: "curated_lst" | "non_liquid";
  tx_hash?: string;
}) => {
  trackEvent({
    event_name: "Staking Transaction Success",
    event_data: props,
  });
};

const trackStakingTransactionFailed = (props: {
  error_type: string;
  error_message: string;
  pool_id: string;
  pool_type: "curated_lst" | "non_liquid";
}) => {
  trackEvent({
    event_name: "Staking Transaction Failed",
    event_data: props,
  });
};

const trackStakingSkipped = (props: { lockup_balance_near?: string }) => {
  trackEvent({ event_name: "Staking Skipped", event_data: props });
};

const trackStakingDialogClosed = (props: {
  step_abandoned: string;
  time_in_flow_ms: number;
}) => {
  trackEvent({ event_name: "Staking Dialog Closed", event_data: props });
};

// --- Unstaking & Withdrawal (§2b) ---

const trackUnstakeFlowStarted = (props: {
  pool_id: string;
  staked_amount_yocto: string;
  has_pending_withdrawal: boolean;
}) => {
  trackEvent({ event_name: "Unstake Flow Started", event_data: props });
};

const trackUnstakeTimerWarningShown = (props: {
  pending_withdrawal_amount: string;
}) => {
  trackEvent({
    event_name: "Unstake Timer Warning Shown",
    event_data: props,
  });
};

const trackUnstakeTimerWarningProceeded = (props: {
  pending_withdrawal_amount: string;
}) => {
  trackEvent({
    event_name: "Unstake Timer Warning Proceeded",
    event_data: props,
  });
};

const trackUnstakeTimerWarningCancelled = (props: {
  pending_withdrawal_amount: string;
}) => {
  trackEvent({
    event_name: "Unstake Timer Warning Cancelled",
    event_data: props,
  });
};

const trackUnstakeTransactionSuccess = (props: {
  amount_yocto: string;
  pool_id: string;
  tx_hash?: string;
}) => {
  trackEvent({
    event_name: "Unstake Transaction Success",
    event_data: props,
  });
};

const trackUnstakeTransactionFailed = (props: {
  error_type: string;
  error_message: string;
}) => {
  trackEvent({
    event_name: "Unstake Transaction Failed",
    event_data: props,
  });
};

// --- Rewards Claiming (§3) ---

const trackRewardsPageViewed = (props: {
  has_unclaimed_rewards: boolean;
  unclaimed_amount_yocto?: string;
}) => {
  trackEvent({ event_name: "Rewards Page Viewed", event_data: props });
};

const trackClaimInitiated = (props: {
  amount_yocto: string;
  num_campaigns: number;
}) => {
  trackEvent({ event_name: "Claim Initiated", event_data: props });
};

const trackClaimSuccess = (props: {
  amount_yocto: string;
  num_campaigns: number;
}) => {
  trackEvent({ event_name: "Claim Success", event_data: props });
};

const trackClaimFailed = (props: {
  error_type: string;
  error_message: string;
}) => {
  trackEvent({ event_name: "Claim Failed", event_data: props });
};

// --- Delegation Flow (§4) ---

const trackDelegationStarted = (props: {
  delegate_address: string;
  current_delegate?: string;
  voting_power_yocto: string;
}) => {
  trackEvent({ event_name: "Delegation Started", event_data: props });
};

const trackDelegationSuccess = (props: {
  delegate_address: string;
  voting_power_yocto: string;
}) => {
  trackEvent({ event_name: "Delegation Success", event_data: props });
};

const trackDelegationFailed = (props: {
  delegate_address: string;
  error_type: string;
  error_message: string;
}) => {
  trackEvent({ event_name: "Delegation Failed", event_data: props });
};

const trackUndelegationStarted = (props: {
  delegate_address: string;
  voting_power_yocto: string;
}) => {
  trackEvent({ event_name: "Undelegation Started", event_data: props });
};

const trackUndelegationSuccess = (props: { delegate_address: string }) => {
  trackEvent({ event_name: "Undelegation Success", event_data: props });
};

const trackUndelegationFailed = (props: {
  delegate_address: string;
  error_type: string;
  error_message: string;
}) => {
  trackEvent({ event_name: "Undelegation Failed", event_data: props });
};

// --- Delegate Discovery (P5 continued) ---

const trackDelegatePageViewed = (props: {
  delegates_count: number;
  filter_applied: string;
  sort_by: string;
}) => {
  trackEvent({ event_name: "Delegates Page Viewed", event_data: props });
};

const trackDelegateProfileViewed = (props: {
  delegate_address: string;
  delegate_name?: string;
  delegate_rank?: number;
  delegate_voting_power: string;
}) => {
  trackEvent({ event_name: "Delegate Profile Viewed", event_data: props });
};

const trackDelegateSearchPerformed = (props: {
  search_query: string;
  results_count: number;
}) => {
  trackEvent({ event_name: "Delegate Search Performed", event_data: props });
};

const trackDelegateFilterApplied = (props: {
  filter_type: string;
  filter_value: string;
}) => {
  trackEvent({ event_name: "Delegate Filter Applied", event_data: props });
};

const trackDelegateCardCtaClicked = (props: {
  delegate_address: string;
  source: string;
}) => {
  trackEvent({ event_name: "Delegate Card CTA Clicked", event_data: props });
};

// --- Proposal Submission & Viewing (P6) ---

const trackCreateProposalCtaClicked = (props: {
  user_voting_power: string;
  is_delegate: boolean;
}) => {
  trackEvent({
    event_name: "Create Proposal CTA Clicked",
    event_data: props,
  });
};

const trackProposalDraftStarted = (props: { proposal_type?: string }) => {
  trackEvent({ event_name: "Proposal Draft Started", event_data: props });
};

const trackProposalDraftSaved = (props: {
  title_length: number;
  body_length: number;
  has_forum_link: boolean;
}) => {
  trackEvent({ event_name: "Proposal Draft Saved", event_data: props });
};

const trackProposalSubmitted = (props: {
  proposal_id: string; // ID might be tx hash initially
  proposal_type: string;
  tx_hash: string;
}) => {
  trackEvent({ event_name: "Proposal Submitted", event_data: props });
};

const trackProposalSubmissionFailed = (props: {
  error_type: string;
  error_message: string;
}) => {
  trackEvent({ event_name: "Proposal Submission Failed", event_data: props });
};

const trackProposalListViewed = (props: {
  filter_status: string;
  sort_by: string;
  proposals_visible: number;
}) => {
  trackEvent({ event_name: "Proposal List Viewed", event_data: props });
};

const trackProposalDetailViewed = (props: {
  proposal_id: string;
  proposal_status: string;
  proposal_category: string;
  time_to_deadline_hours?: number;
}) => {
  trackEvent({ event_name: "Proposal Detail Viewed", event_data: props });
};

const trackProposalForumLinkClicked = (props: { proposal_id: string }) => {
  trackEvent({
    event_name: "Proposal Forum Link Clicked",
    event_data: props,
  });
};

// --- Delegate Onboarding (P6 continued) ---

const trackBecomeDelegateCtaClicked = (props: {
  user_venear_balance: string;
  has_existing_statement: boolean;
}) => {
  trackEvent({
    event_name: "Become Delegate CTA Clicked",
    event_data: props,
  });
};

const trackDelegateStatementEditorOpened = (props: { is_edit: boolean }) => {
  trackEvent({
    event_name: "Delegate Statement Editor Opened",
    event_data: props,
  });
};

const trackDelegateStatementSaved = (props: {
  statement_length_chars: number;
  has_twitter: boolean;
  has_discord: boolean;
  topics_selected_count: number;
  is_edit: boolean;
}) => {
  trackEvent({ event_name: "Delegate Statement Saved", event_data: props });
};

const trackExternalLinkClicked = (props: {
  link_url: string;
  link_context: string;
}) => {
  trackEvent({ event_name: "External Link Clicked", event_data: props });
};

const trackDelegateSortChanged = (props: { sort_option: string }) => {
  trackEvent({
    event_name: "Delegate Filter Applied",
    event_data: { filter_type: "sort", filter_value: props.sort_option },
  });
};

const trackProposalVoteFilterChanged = (props: { filter_option: string }) => {
  trackEvent({
    event_name: "Proposal Vote Filter Changed",
    event_data: props,
  });
};

const trackGenericEvent = (
  eventName: string,
  eventData?: Record<string, unknown>
) => {
  trackEvent({
    event_name: eventName,
    event_data: eventData,
  });
};

export const useAnalytics = () => {
  return {
    identifyUser,
    trackWalletSelectorOpened,
    trackWalletSelected,
    trackWalletConnected,
    trackWalletConnectionFailed,
    trackWalletDisconnected,
    trackLockingFlowStarted,
    trackLockDialogOpened,
    trackLockAmountEntered,
    trackLockDurationSelected,
    trackLockReviewStepReached,
    trackLockTransactionInitiated,
    trackLockTransactionSuccess,
    trackLockTransactionFailed,
    trackLockDialogClosed,
    trackUnlockFlowStarted,
    trackUnlockAmountEntered,
    trackUnlockReviewReached,
    trackUnlockTransactionInitiated,
    trackUnlockTransactionSuccess,
    trackUnlockTransactionFailed,
    trackUnlockDialogClosed,
    trackVoteDialogOpened,
    trackVoteOptionSelected,
    trackVoteCast,
    trackVoteFailed,
    trackStakingFlowStarted,
    trackStakingPoolSelected,
    trackCustomPoolEntered,
    trackStakingAmountEntered,
    trackStakingTransactionSuccess,
    trackStakingTransactionFailed,
    trackStakingSkipped,
    trackStakingDialogClosed,
    trackUnstakeFlowStarted,
    trackUnstakeTimerWarningShown,
    trackUnstakeTimerWarningProceeded,
    trackUnstakeTimerWarningCancelled,
    trackUnstakeTransactionSuccess,
    trackUnstakeTransactionFailed,
    trackRewardsPageViewed,
    trackClaimInitiated,
    trackClaimSuccess,
    trackClaimFailed,
    trackDelegationStarted,
    trackDelegationSuccess,
    trackDelegationFailed,
    trackUndelegationStarted,
    trackUndelegationSuccess,
    trackUndelegationFailed,
    trackDelegatePageViewed,
    trackDelegateProfileViewed,
    trackDelegateSearchPerformed,
    trackDelegateFilterApplied,
    trackDelegateCardCtaClicked,
    trackCreateProposalCtaClicked,
    trackProposalDraftStarted,
    trackProposalDraftSaved,
    trackProposalSubmitted,
    trackProposalSubmissionFailed,
    trackProposalListViewed,
    trackProposalDetailViewed,
    trackProposalForumLinkClicked,
    trackBecomeDelegateCtaClicked,
    trackDelegateStatementEditorOpened,
    trackDelegateStatementSaved,
    trackExternalLinkClicked,
    trackDelegateSortChanged,
    trackProposalVoteFilterChanged,
    trackGenericEvent,
  };
};
