import { TokenWithBalance } from "@/lib/types";
import { yoctoNearToUsdFormatted } from "@/lib/utils";
import { usePrice } from "@/hooks/usePrice";
import { useLockProviderContext } from "../LockProvider";
import Image from "next/image";
import TokenAmount from "../../shared/TokenAmount";
import { Skeleton } from "../../ui/skeleton";

type AssetSelectorProps = {
  handleTokenSelect: (token: TokenWithBalance) => void;
  onBack: () => void;
};

export const AssetSelector = ({
  handleTokenSelect,
  onBack,
}: AssetSelectorProps) => {
  const { availableTokens } = useLockProviderContext();
  const { price, isLoading: isLoadingPrice } = usePrice();

  return (
    <div className="flex flex-col items-center w-full bg-neutral w-full h-full">
      <div className="flex items-center justify-between w-full mb-6">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 bg-primary rounded-full text-neutral hover:opacity-80 transition-colors"
          aria-label="Go back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-primary">Select Asset</h2>
        <div className="w-10"></div> {/* Spacer for centering title */}
      </div>
      <div className="flex flex-col gap-2 w-full">
        {availableTokens.map((token: TokenWithBalance, index: number) => {
          return (
            <button
              key={index}
              onClick={() => handleTokenSelect(token)}
              className="flex flex-row items-center justify-between w-full py-2 rounded-lg text-left"
            >
              <div className="flex flex-row items-center gap-3">
                <div className="w-10 h-10 bg-wash rounded-full flex items-center justify-center text-sm shrink-0 relative">
                  {token.metadata?.icon ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={token.metadata.icon}
                        alt={token.metadata.name}
                        width={0}
                        height={0}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                  ) : (
                    token.metadata?.name.substring(0, 1)
                  )}
                </div>
                <div>
                  <p className="font-medium text-primary">
                    {token.metadata?.symbol}
                  </p>
                  <p className="text-xs text-secondary">
                    {token.type === "lockup" ? (
                      "Lockup Contract"
                    ) : (
                      <span
                        className="truncate max-w-[120px]"
                        title={token.accountId}
                      >
                        {token.accountId}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <TokenAmount
                  amount={token.balance}
                  currency={token.metadata?.symbol}
                  minimumFractionDigits={4}
                  className="text-primary font-medium"
                />
                {isLoadingPrice ? (
                  <Skeleton className="w-16 h-4" />
                ) : (
                  <p className="text-xs text-secondary tabular-nums">
                    {yoctoNearToUsdFormatted(token.balance, String(price))}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
