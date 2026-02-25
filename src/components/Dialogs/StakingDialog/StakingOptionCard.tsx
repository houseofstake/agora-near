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
      className={`rounded-lg p-4 gap-4 flex flex-col cursor-pointer transition-all duration-200 border border-primary ${
        isSelected
          ? "bg-[#00E391] text-black"
          : "bg-gray-50 text-black hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center gap-2">
        <Image
          src={tokenMetadata.icon}
          alt={tokenMetadata.symbol}
          width={24}
          height={24}
          className="rounded-full border border-primary bg-neutral"
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
