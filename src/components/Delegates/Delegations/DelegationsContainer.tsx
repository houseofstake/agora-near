"use client";

import DelegationToRow from "./DelegationToRow";
import DelegationFromRow from "./DelegationFromRow";
import TokenAmount from "@/components/shared/TokenAmount";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDelegatedFrom } from "@/hooks/useDelegatedFrom";
import { useDelegatedTo } from "@/hooks/useDelegatedTo";
import { DelegationsContainerSkeleton } from "./DelegationsContainerWrapper";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

function DelegationsContainer({ address }: { address: string }) {
  const {
    data: delegatedFrom,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingDelegatedFrom,
    fetchNextPage,
    selfLockedVotingPower,
  } = useDelegatedFrom({
    pageSize: 20,
    address,
  });

  const { data: delegatedTo, isLoading: isLoadingDelegatedTo } = useDelegatedTo(
    {
      pageSize: 20,
      address,
    }
  );

  const isLoading =
    isLoadingDelegatedFrom || isLoadingDelegatedTo || isFetchingNextPage;

  const loadMore = async () => {
    fetchNextPage();
  };

  if (isLoading) {
    return <DelegationsContainerSkeleton />;
  }

  if (delegatedTo?.length === 0 && delegatedFrom?.length === 0) {
    return (
      <div className="p-8 text-center text-secondary align-middle bg-wash rounded-xl">
        No delegations found.
      </div>
    );
  }

  return (
    <div className="max-w-full text-primary">
      <Tabs className="max-w-full mb-8" defaultValue="delegatedFrom">
        <div className="flex flex-row items-center justify-between">
          <TabsList>
            <TabsTrigger className="text-2xl" value="delegatedFrom">
              Delegated from
            </TabsTrigger>
            <TabsTrigger className="text-2xl" value="delegatedTo">
              Delegated to
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="delegatedFrom" className="max-w-full">
          <div className="flex flex-col gap-3 border border-line shadow-sm rounded-xl overflow-auto max-h-[500px] bg-wash">
            {selfLockedVotingPower != null && (
              <div className="px-4 pt-3 flex items-center gap-2">
                <span className="text-secondary text-sm">Self-locked voting power:</span>
                <TokenAmount amount={selfLockedVotingPower} currency="veNEAR" />
              </div>
            )}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[600px]">
                <Table className="min-w-full">
                  <TableHeader className="text-xs text-secondary sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead className="h-10 text-secondary">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="flex flex-row gap-1 items-center">
                              Voting Power
                              <InformationCircleIcon className="w-4 h-4" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Voting power is as of the point in time when
                              delegation was made.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableHead>
                      <TableHead className="h-10 text-secondary">
                        Delegated on
                      </TableHead>
                      <TableHead className="h-10 text-secondary">
                        From
                      </TableHead>
                      <TableHead className="h-10 text-secondary">
                        Txn Hash
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {delegatedFrom?.length === 0 ? (
                      <td
                        className="w-full p-4 bg-neutral text-center text-secondary text-sm"
                        colSpan={6}
                      >
                        None found
                      </td>
                    ) : (
                      delegatedFrom?.map((delegation) => (
                        <DelegationFromRow
                          key={delegation.id}
                          delegation={delegation}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
                {hasNextPage && (
                  <div className="text-center my-4">
                    <button
                      onClick={loadMore}
                      disabled={isLoading}
                      className="px-4 py-2 text-primary text-sm bg-wash hover:bg-wash/80 rounded-lg"
                    >
                      {isLoading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="delegatedTo">
          <div className="flex flex-col gap-3 border border-line shadow-sm rounded-xl overflow-auto max-h-[500px]">
            <Table>
              <TableHeader className="text-xs text-secondary sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead className="h-10 text-secondary">
                    Voting Power
                  </TableHead>
                  <TableHead className="h-10 text-secondary">
                    Delegated on
                  </TableHead>
                  <TableHead className="h-10 text-secondary">To</TableHead>
                  <TableHead className="h-10 text-secondary">
                    Txn Hash
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delegatedTo?.length === 0 ? (
                  <TableRow>
                    <td
                      className="w-full p-4 bg-neutral text-center text-secondary text-sm"
                      colSpan={6}
                    >
                      None found
                    </td>
                  </TableRow>
                ) : (
                  delegatedTo?.map((delegation) => (
                    <DelegationToRow
                      key={delegation.id}
                      delegation={delegation}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DelegationsContainer;
