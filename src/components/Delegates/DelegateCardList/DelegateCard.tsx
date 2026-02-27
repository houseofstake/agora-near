import TokenAmount from "@/components/shared/TokenAmount";
import { DelegateProfile } from "@/lib/api/delegates/types";
import { sanitizeContent, stripMarkdown } from "@/lib/sanitizationUtils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useMemo } from "react";
import { DelegateActions } from "../DelegateCard/DelegateActions";
import { EndorsedTooltip } from "./EndorsedTooltip";
import { useAnalytics } from "@/hooks/useAnalytics";
import { DelegateAddress } from "../DelegateCard/DelegateAddress";
import { useVotingPower } from "@/hooks/useVotingPower";

type DelegateCardProps = {
  delegate: DelegateProfile;
  isDelegatesFiltering: boolean;
  displayName?: string;
};

const DelegateCard = ({
  delegate,
  isDelegatesFiltering,
  displayName,
}: DelegateCardProps) => {
  const sanitizedTruncatedStatement = useMemo(() => {
    const truncatedStatement = stripMarkdown(delegate.statement ?? "").slice(
      0,
      120
    );
    return sanitizeContent(truncatedStatement);
  }, [delegate.statement]);
  const endorsed = delegate.endorsed;

  const { trackDelegateCardCtaClicked } = useAnalytics();

  return (
    <div
      key={delegate.address}
      className={cn(
        "flex flex-col",
        isDelegatesFiltering ? "animate-pulse" : ""
      )}
      onClick={() => {
        trackDelegateCardCtaClicked({
          delegate_address: delegate.address,
          source: "delegate_card",
        });
      }}
    >
      <Link href={`/delegates/${delegate.address}`}>
        <div className="flex flex-col gap-4 h-full rounded-xl bg-wash border border-line shadow-newDefault">
          <div className="flex flex-col gap-4 justify-center pt-4">
            <div className="border-b border-line px-4 pb-4 flex flex-row gap-2 items-center">
              <div className="truncate max-w-[280px]" title={delegate.address}>
                <DelegateAddress
                  address={delegate.address}
                  shouldTruncate={true}
                  displayName={displayName}
                  fetchDisplayName={false}
                  inlineDisplay={true}
                />
              </div>
              {endorsed && <EndorsedTooltip />}
            </div>
            <div className="px-4 flex flex-row gap-4 min-h-[24px]">
              <span className="text-primary font-bold">
                <TokenAmount
                  amount={delegate.votingPower ?? "0"}
                  minimumFractionDigits={1}
                  maximumSignificantDigits={1}
                  currency="veNEAR"
                />
              </span>
            </div>
            <div className="min-h-[48px] px-4">
              {sanitizedTruncatedStatement ? (
                <p className="text-base leading-normal break-words text-secondary overflow-hidden line-clamp-2">
                  {sanitizedTruncatedStatement}
                </p>
              ) : (
                <p className="hidden"></p>
              )}
            </div>
          </div>
          <div className="min-h-[24px] px-4 pb-4">
            <DelegateActions delegate={delegate} />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default DelegateCard;
