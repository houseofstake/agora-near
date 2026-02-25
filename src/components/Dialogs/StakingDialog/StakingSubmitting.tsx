import coin from "@/assets/Staking.png";
import { UpdatedButton } from "@/components/Button";
import TokenAmount from "@/components/shared/TokenAmount";
import { TooltipWithTap } from "@/components/ui/tooltip-with-tap";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useMemo } from "react";
import { useStakingProviderContext } from "../StakingProvider";
import { StakingStep } from "./StakingReview";

export const StakingSubmitting = ({
  requiredSteps,
  currentStep,
}: {
  requiredSteps: (StakingStep | "top_up" | "lock")[];
  currentStep: number;
}) => {
  const { enteredAmountYoctoNear } = useStakingProviderContext();

  const stepMessage = useMemo(() => {
    switch (requiredSteps[currentStep]) {
      case "select_pool":
        return "Selecting pool...";
      case "top_up":
        return "Transferring NEAR to your lockup...";
      case "lock":
        return "Locking NEAR in your lockup...";
      case "stake":
        return "Staking your NEAR...";
    }
  }, [currentStep, requiredSteps]);

  return (
    <div className="flex flex-col h-full items-center w-full justify-center">
      <div className="flex-1 flex flex-col justify-end items-center gap-6">
        <Image src={coin} alt="coin" width={300} height={300} />
        <div className="text-center">
          <p className="text-md text-gray-500 mb-2">{stepMessage}</p>
          <div className="text-4xl font-bold text-gray-900">
            <TokenAmount amount={enteredAmountYoctoNear} />
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-end w-full gap-4">
        <div className="bg-neutral border border-line rounded-xl overflow-hidden flex items-center shadow-sm">
          <div className="flex items-center justify-center bg-[#9797FF]/30 gap-3 w-[40px] h-[40px]">
            <InformationCircleIcon className="w-5 h-5 text-[#9797FF]" />
          </div>
          <div className="flex flex-row w-full justify-center items-center gap-2">
            <span className="text-sm font-medium">
              {`Pending ${currentStep + 1} of ${requiredSteps.length} wallet signatures`}
            </span>
            <TooltipWithTap
              content={
                <div className="max-w-[300px] flex flex-col text-left p-3">
                  <h4 className="text-lg font-bold">
                    You&apos;ll need to complete a few wallet signatures to
                    complete setup.
                  </h4>
                  <div className="border-b border-line my-2" />
                  <ul className="text-sm space-y-1 font-medium list-disc pl-4">
                    <li>Select your staking pool (if needed)</li>
                    <li>Transfer NEAR to your lockup (if needed)</li>
                    <li>Lock NEAR in your lockup (if needed)</li>
                    <li>Stake your NEAR</li>
                  </ul>
                </div>
              }
            >
              <InformationCircleIcon className="w-5 h-5 text-[#9D9FA1]" />
            </TooltipWithTap>
          </div>
        </div>
        <UpdatedButton
          type="secondary"
          className="flex w-full justify-center items-center"
          variant="rounded"
        >
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </UpdatedButton>
      </div>
    </div>
  );
};
