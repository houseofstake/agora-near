import { memo, useMemo } from "react";
import { ProjectionSlider } from "../shared/ProjectionSlider/ProjectionSlider";
import { useVenearSnapshot } from "@/hooks/useVenearSnapshot";
import { getAPYFromGrowthRate } from "@/lib/lockUtils";
import { formatNearAmount } from "@near-js/utils";

interface VotingPowerProjectionsDialogProps {
  closeDialog: () => void;
  votingPower: string;
}

export const VotingPowerProjectionsDialog = memo(
  ({ votingPower }: VotingPowerProjectionsDialogProps) => {
    const { growthRateNs } = useVenearSnapshot();

    const lockApy = useMemo(
      () => getAPYFromGrowthRate(growthRateNs),
      [growthRateNs]
    );

    const apyDecimal = useMemo(() => {
      try {
        return parseFloat(lockApy) / 100;
      } catch {
        return 0;
      }
    }, [lockApy]);

    // Convert voting power from yoctoNEAR to NEAR
    const startingAmount = useMemo(() => {
      try {
        const nearAmount = formatNearAmount(votingPower);
        return parseFloat(nearAmount || "0");
      } catch {
        return 0;
      }
    }, [votingPower]);

    return (
      <div className="flex flex-col p-6">
        <ProjectionSlider
          apy={apyDecimal}
          startingAmount={startingAmount}
          className="w-full"
        />
      </div>
    );
  }
);

VotingPowerProjectionsDialog.displayName = "VotingPowerProjectionsDialog";
