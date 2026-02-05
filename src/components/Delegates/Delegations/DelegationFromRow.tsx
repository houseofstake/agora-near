"use client";

import TokenAmount from "@/components/shared/TokenAmount";
import { TableCell, TableRow } from "@/components/ui/table";
import { useNearBlocks } from "@/hooks/useNearBlocks";
import { DelegationEvent } from "@/lib/api/delegates/types";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { format } from "date-fns";
import Link from "next/link";
import { truncateAddress } from "@/lib/text";

export default function DelegationFromRow({
  delegation,
}: {
  delegation: DelegationEvent;
}) {
  const { openTransactionByReceiptId } = useNearBlocks();

  return (
    <TableRow>
      <TableCell>
        <TokenAmount amount={delegation.nearAmount ?? "0"} currency="veNEAR" />
      </TableCell>
      <TableCell>{format(delegation.eventTimestamp, "yyyy-MM-dd")}</TableCell>
      <TableCell>
        <Link
          href={`/delegates/${delegation.delegatorId}`}
          title={`Address ${delegation.delegatorId}`}
        >
          <span
            className="truncate max-w-[120px]"
            title={delegation.delegatorId}
          >
            {truncateAddress(delegation.delegatorId || "")}
          </span>
        </Link>
      </TableCell>
      <TableCell>
        <button
          onClick={() => openTransactionByReceiptId(delegation.receiptId ?? "")}
        >
          View
          <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2 inline align-text-bottom" />
        </button>
      </TableCell>
    </TableRow>
  );
}
