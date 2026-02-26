import TokenAmount from "@/components/shared/TokenAmount";
import { LINEAR_TOKEN_METADATA } from "@/lib/constants";
import Image from "next/image";

type StakingOptionCardProps = {
  isSelected: boolean;
  onSelect: () => void;
  tokenMetadata: typeof LINEAR_TOKEN_METADATA;
  apy: number | undefined;
  totalVolumeYocto: string;
  isEnabled?: boolean;
};

export const StakingOptionCard = ({
  isSelected,
  onSelect,
  tokenMetadata,
  apy,
  totalVolumeYocto,
  isEnabled = true,
}: StakingOptionCardProps) => {
  return (
    <div
      onClick={isEnabled ? onSelect : undefined}
      className={`rounded-lg p-4 gap-4 flex flex-col transition-all duration-200 border border-black ${
        !isEnabled ? "cursor-not-allowed" : "cursor-pointer"
      } ${
        isSelected && isEnabled
          ? "bg-[#00E391] text-black"
          : isSelected && !isEnabled
            ? "bg-gray-200 text-gray-500 border-gray-300"
            : "bg-gray-50 text-black hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center gap-2">
        <Image
          src={tokenMetadata.icon}
          alt={tokenMetadata.symbol}
          width={24}
          height={24}
          className="rounded-full border border-black bg-white"
        />
        <span>{tokenMetadata.name}</span>
      </div>
      <div className="flex flex-col">
        <div className="text-xs text-[#676767]">EST. APY</div>
        <div className="text-3xl sm:text-4xl font-light break-words">
          {apy ? `${apy.toFixed(2)}%` : <span className="text-lg">-</span>}
        </div>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <div className="text-xs text-[#676767]">
          <span>Tot. Vol</span>
        </div>
        <div className="text-xs text-black">
          <TokenAmount
            amount={totalVolumeYocto}
            compact={true}
            hideCurrency={true}
            maximumSignificantDigits={2}
          />
        </div>
      </div>
    </div>
  );
};
