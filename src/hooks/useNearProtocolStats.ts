import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useNear } from "@/contexts/NearContext";
import { CACHE_TTL } from "@/lib/constants";

interface NearBlocksValidatorsResponse {
  lastEpochApy: string;
  // We can add other fields if needed, but for now we only need APY
}

const getBaseUrl = (networkId: string) => {
  return networkId === "testnet"
    ? "https://api-testnet.nearblocks.io/v1/validators"
    : "https://api.nearblocks.io/v1/validators";
};

export const useNearProtocolStats = () => {
  const { networkId } = useNear();

  return useQuery({
    queryKey: ["nearProtocolStats", networkId],
    queryFn: async () => {
      try {
        const response = await axios.get<NearBlocksValidatorsResponse>(
          getBaseUrl(networkId)
        );
        return response.data;
      } catch (error) {
        console.warn("Failed to fetch NearBlocks stats, using fallback", error);
        return { lastEpochApy: "5.00" };
      }
    },
    staleTime: CACHE_TTL.MEDIUM, // 1 hour
    select: (data) => ({
      apy: Number(data.lastEpochApy),
    }),
  });
};
