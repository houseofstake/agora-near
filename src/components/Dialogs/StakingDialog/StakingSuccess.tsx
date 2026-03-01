import { UpdatedButton } from "@/components/Button";
import Image from "next/image";
import stakeSuccessIcon from "@/assets/Staked.png";

type StakingSuccessProps = {
  onStakeMore: () => void;
  onViewDashboard: () => void;
};

export const StakingSuccess = ({
  onStakeMore,
  onViewDashboard,
}: StakingSuccessProps) => {
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="flex-1 flex flex-col items-center justify-end gap-6">
        <Image src={stakeSuccessIcon} alt="coin" width={300} height={300} />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Staked, locked, and loaded.
          </h1>
          <p className="text-md text-gray-500">
            You&apos;re now earning staking rewards. Note: Staking doesn&apos;t
            affect your voting power.
          </p>
        </div>
      </div>
      <div className="flex-1 w-full flex flex-col justify-end gap-3">
        <UpdatedButton
          type="secondary"
          onClick={onStakeMore}
          className="w-full"
          variant="rounded"
        >
          Stake More Funds
        </UpdatedButton>
        <UpdatedButton
          type="primary"
          onClick={onViewDashboard}
          className="w-full"
          variant="rounded"
        >
          View Dashboard
        </UpdatedButton>
      </div>
    </div>
  );
};
