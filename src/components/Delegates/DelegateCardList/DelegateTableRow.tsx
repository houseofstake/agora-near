"use client";

import TokenAmount from "@/components/shared/TokenAmount";
import { TableCell, TableRow } from "@/components/ui/table";
import { DelegateProfile } from "@/lib/api/delegates/types";
import { useRouter } from "next/navigation";
import { DelegateAddress } from "../DelegateCard/DelegateAddress";
import { EndorsedTooltip } from "./EndorsedTooltip";
import { useVotingPower } from "@/hooks/useVotingPower";

export default function DelegateTableRow({
  delegate,
  displayName,
}: {
  delegate: DelegateProfile;
  displayName?: string;
}) {
  const router = useRouter();
  const endorsed = delegate.endorsed;

  return (
    <TableRow
      className="font-semibold cursor-pointer bg-neutral text-secondary"
      onClick={() => {
        router.push(`/delegates/${delegate.address}`);
      }}
    >
      <TableCell className="hidden sm:flex gap-2 items-center">
        <DelegateAddress
          address={delegate.address}
          shouldTruncate={true}
          displayName={displayName}
          fetchDisplayName={false}
        />
        {endorsed && <EndorsedTooltip />}
      </TableCell>
      <TableCell className="flex sm:hidden gap-2 items-center">
        <DelegateAddress
          address={delegate.address}
          displayName={displayName}
          fetchDisplayName={false}
        />
        {endorsed && <EndorsedTooltip />}
      </TableCell>
      <TableCell>
        {delegate.votingPower ? (
          <TokenAmount
            amount={delegate.votingPower ?? "0"}
            minimumFractionDigits={1}
            maximumSignificantDigits={1}
            currency="veNEAR"
          />
        ) : (
          "-"
        )}
      </TableCell>
    </TableRow>
  );
}
