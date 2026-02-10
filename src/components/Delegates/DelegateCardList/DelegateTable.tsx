"use client";

import InfiniteScroll from "react-infinite-scroller";
const InfiniteScrollAny = InfiniteScroll as any;
import { DialogProvider } from "@/components/Dialogs/DialogProvider/DialogProvider";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DelegateTableRow from "./DelegateTableRow";
import { DelegateProfile } from "@/lib/api/delegates/types";
import { cn } from "@/lib/utils";
import { EncourageDelegationBanner } from "./EncourageDelegationBanner";
import Tenant from "@/lib/tenant/tenant";

interface Props {
  delegates?: DelegateProfile[];
  hasMore: boolean;
  onLoadMore: () => void;
  isDelegatesFiltering: boolean;
  orderByParam: string | null;
  filterParam: string | null;
}

export default function DelegateTable({
  delegates,
  hasMore,
  onLoadMore,
  isDelegatesFiltering,
  orderByParam,
  filterParam,
}: Props) {
  const { ui } = Tenant.current();
  const isDelegationEncouragementEnabled = ui.toggle(
    "delegation-encouragement"
  )?.enabled;

  return (
    <DialogProvider>
      {isDelegationEncouragementEnabled && (
        <EncourageDelegationBanner filterParam={filterParam} />
      )}
      <div
        className={cn(
          "overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg mt-6",
          isDelegatesFiltering && "animate-pulse"
        )}
      >
        <Table className="min-w-full">
          <TableHeader className="text-sm text-secondary sticky top-0 bg-neutral z-10 rounded-t-lg">
            <TableRow className="bg-tertiary/5">
              <TableHead className="h-10 text-secondary">Name</TableHead>
              <TableHead className="h-10 text-secondary">
                Voting power
              </TableHead>
            </TableRow>
          </TableHeader>
          <InfiniteScrollAny
            key={`${orderByParam}-${filterParam}`}
            hasMore={hasMore}
            pageStart={1}
            loadMore={onLoadMore}
            loader={
              <TableRow key={0}>
                <TableCell
                  key="loader"
                  className="gl_loader justify-center py-6 text-sm text-secondary"
                >
                  Loading...
                </TableCell>
              </TableRow>
            }
            // References styles of TableBody
            className="[&_tr:last-child]:border-0"
            element="tbody"
          >
            {delegates?.length === 0 ? (
              <td
                className="w-full p-4 bg-neutral text-center text-secondary text-sm"
                colSpan={6}
              >
                None found
              </td>
            ) : (
              delegates?.map((delegate) => (
                <DelegateTableRow key={delegate.address} delegate={delegate} />
              ))
            )}
          </InfiniteScrollAny>
        </Table>
      </div>
    </DialogProvider>
  );
}
