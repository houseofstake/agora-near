import { CONTRACTS } from "@/lib/contractConstants";
import { useCallback, useEffect, useState } from "react";
import { useReadHOSContract } from "./useReadHOSContract";
import { useRpcUrl } from "./useRpcUrl";
import { JsonRpcProvider } from "@near-js/providers";

export const useTotalSupply = () => {
  const [isLoadingTotalSupply, setIsLoadingTotalSupply] = useState(true);
  const [totalSupply, setTotalSupply] = useState<string | undefined>(undefined);

  const rpcUrl = useRpcUrl({});

  const [{ data: votableSupply, isLoading: isLoadingVotableSupply }] =
    useReadHOSContract([
      {
        contractId: CONTRACTS.VENEAR_CONTRACT_ID,
        methodName: "ft_total_supply",
        config: { args: {} },
      },
    ]);

  const init = useCallback(async () => {
    const provider = new JsonRpcProvider({ url: rpcUrl });
    const block = await provider.block({ finality: "final" });
    setTotalSupply(block.header.total_supply);

    setIsLoadingTotalSupply(false);
  }, [rpcUrl]);

  useEffect(() => {
    init();
  }, [init]);

  return {
    totalSupply: totalSupply,
    votableSupply: votableSupply,
    isLoadingTotalSupply,
    isLoadingVotableSupply,
  };
};
