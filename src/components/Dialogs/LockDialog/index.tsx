import { LockProvider } from "../LockProvider";
import { LockDialogContent } from "./LockDialogContent";
import { MaintenanceDialog } from "./MaintenanceDialog";
import Tenant from "@/lib/tenant/tenant";
import { useEffect } from "react";
import Big from "big.js";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useNear } from "@/contexts/NearContext";

export type LockDialogSource =
  | "onboarding"
  | "account_management"
  | "claim_rewards";

type NearLockDialogProps = {
  closeDialog: () => void;
  source: LockDialogSource;
  preSelectedTokenId?: string;
  customStakingPoolId?: string;
};

export const NearLockDialog = (props: NearLockDialogProps) => {
  const tenant = Tenant.current();
  const { trackLockingFlowStarted } = useAnalytics();
  const { signedAccountId, getBalance } = useNear();

  useEffect(() => {
    // Check balance if connected
    let hasBalance = false;
    const checkBalance = async () => {
      if (signedAccountId) {
        const balance = await getBalance(signedAccountId);
        hasBalance = Big(balance).gt(0);
      }
      trackLockingFlowStarted(props.source, !!signedAccountId, hasBalance);
    };
    checkBalance();
  }, [props.source, signedAccountId, getBalance, trackLockingFlowStarted]);

  if (tenant.isMaintenanceMode) {
    return <MaintenanceDialog closeDialog={props.closeDialog} />;
  }

  return (
    <LockProvider
      source={props.source}
      preSelectedTokenId={props.preSelectedTokenId}
      customStakingPoolId={props.customStakingPoolId}
    >
      <LockDialogContent closeDialog={props.closeDialog} />
    </LockProvider>
  );
};
