import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useCallback } from "react";

type LiquidStakingTokenLockWarningProps = {
  symbol?: string;
};

export const LiquidStakingTokenLockWarning = ({
  symbol,
}: LiquidStakingTokenLockWarningProps) => {
  const onLearnMorePressed = useCallback(() => {
    window.open("/info?item=fungible-token-withdrawal", "_blank");
  }, []);

  const providerMap: Record<string, string> = {
    stNEAR: "Meta Pool",
    liNEAR: "LiNEAR Protocol",
    rNEAR: "Rhea Labs",
  };
  const provider = symbol ? providerMap[symbol] : "the staking pool";

  return (
    <div className="flex flex-row items-start bg-[#F9F8F7] p-2 rounded-lg">
      <div>
        <ExclamationCircleIcon
          width={24}
          height={24}
          className="text-[#B60D0D]"
        />
      </div>
      <p className="text-sm ml-2">
        Your {symbol || "liquid staking tokens"} will be unstaked and you will
        no longer receive staking rewards from {provider} on this balance.{" "}
        <button onClick={onLearnMorePressed} className="underline">
          Learn more
        </button>
      </p>
    </div>
  );
};
