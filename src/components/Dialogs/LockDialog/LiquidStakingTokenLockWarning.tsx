import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useCallback } from "react";

type LiquidStakingTokenLockWarningProps = {
  symbol?: string;
};

export const LiquidStakingTokenLockWarning = ({
  symbol,
}: LiquidStakingTokenLockWarningProps) => {
  const onLearnMorePressed = useCallback(() => {
    window.open(
      "https://hos-docs.vercel.app/docs/overview/faqs#fungible-token-withdrawal",
      "_blank"
    );
  }, []);

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
        Once you transfer your {symbol || "liquid staking tokens"}, you will not
        be able to withdraw without unstaking first.{" "}
        <button onClick={onLearnMorePressed} className="underline">
          Learn more
        </button>
      </p>
    </div>
  );
};
