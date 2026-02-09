import { ArrowLeft } from "lucide-react";
import { memo, useCallback } from "react";

type StakingDisclosuresProps = {
  onBack: () => void;
};

export const StakingDisclosures = memo(
  ({ onBack }: StakingDisclosuresProps) => {
    const handleBackClick = useCallback(() => {
      onBack();
    }, [onBack]);

    return (
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 hover:text-gray-900"
          >
            <ArrowLeft width={16} height={16} />
            <span className="text-sm font-bold">Back</span>
          </button>
        </div>

        <div className="my-2">
          <h1 className="text-2xl font-bold text-gray-900">Disclosures</h1>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Staking NEAR Earns Rewards
            </h2>
            <p className="text-[#3C3C3C] leading-relaxed text-sm">
              Staking your NEAR tokens enables you to earn rewards through a
              supported staking pool. Reward rates are not fixed and depend on
              validator performance and network conditions.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Displayed APY Is an Estimate
            </h2>
            <p className="text-[#3C3C3C] leading-relaxed text-sm">
              The APY you see is only an estimate based on recent performance.
              Actual returns may vary and are not guaranteed.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Unstake via House of Stake
            </h2>
            <p className="text-[#3C3C3C] leading-relaxed text-sm">
              You must unstake your tokens directly through the House of Stake
              interface to ensure they are returned to your lockup contract.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Unstaking May Involve a Delay
            </h2>
            <p className="text-[#3C3C3C] leading-relaxed text-sm">
              After unstaking, there&apos;s a cooldown before your tokens are
              withdrawable. Cooldown times vary: stNEAR (Meta Pool): 48-72
              hours, liNEAR: ~49 hours, rNEAR: ~30 hours. For non-liquid pools,
              typically 2-3 epochs (~2-3 days).
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Smart Contract Use
            </h2>
            <p className="text-[#3C3C3C] leading-relaxed text-sm">
              Locking and unlocking NEAR involves smart contracts. While
              reviewed for security, using smart contracts carries inherent
              risk.
            </p>
          </div>
        </div>
      </div>
    );
  }
);

StakingDisclosures.displayName = "DisclosuresDialog";
