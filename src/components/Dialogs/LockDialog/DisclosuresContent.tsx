import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { memo } from "react";

type DisclosuresContentProps = {
  onBack: () => void;
};

export const DisclosuresContent = memo(
  ({ onBack }: DisclosuresContentProps) => {
    return (
      <div className="flex flex-col pb-4 gap-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-900 hover:text-gray-700"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-md font-medium">Back</span>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Disclosures</h1>

          <div className="flex flex-col gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Locking NEAR Grants veNEAR
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Locking your NEAR tokens converts them into veNEAR, which gives
                you voting power and may boost your rewards.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                You Can Unlock Anytime
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                You can unlock your NEAR whenever you want. There is no fixed
                lock period.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Unlocking Reduces Your Voting Power
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Unlocking NEAR immediately reduces your veNEAR balance, along
                with your voting power and any associated reward boosts.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Rewards Are Variable
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Earning rates may fluctuate based on protocol activity and
                participation. Your rewards are calculated dynamically and
                updated on a rolling basis
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Smart Contract Use
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Locking and unlocking NEAR involves smart contracts. While
                reviewed for security, using smart contracts carries inherent
                risk.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DisclosuresContent.displayName = "DisclosuresContent";
