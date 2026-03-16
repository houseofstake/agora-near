import { Endpoint } from "@/lib/api/constants";
import {
  fetchVenearTotalSupplyHistory,
  VenearSupplyHistoryRange,
} from "@/lib/api/venear/requests";
import { useQuery } from "@tanstack/react-query";

const VENEAR_TOTAL_SUPPLY_HISTORY_QK = `${Endpoint.Venear}/total-supply-history`;

export const useVenearTotalSupplyHistory = (
  range: VenearSupplyHistoryRange
) => {
  const { data, isLoading } = useQuery({
    queryKey: [VENEAR_TOTAL_SUPPLY_HISTORY_QK, range],
    queryFn: () => fetchVenearTotalSupplyHistory(range),
  });

  return { data, isLoading };
};
