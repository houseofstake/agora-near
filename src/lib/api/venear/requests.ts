import axios from "axios";
import { Endpoint } from "../constants";

export type VenearSupplyHistoryRange = "1M" | "3M" | "6M" | "1Y";

export interface VenearTotalSupplyHistoryRecord {
  recorded_at: string;
  total_supply: string;
}

export interface VenearTotalSupplyHistoryResponse {
  data: VenearTotalSupplyHistoryRecord[];
  latest: string | null;
  participants_count: number;
}

export const fetchVenearTotalSupplyHistory = async (
  range: VenearSupplyHistoryRange = "1Y"
) => {
  const response = await axios.get<VenearTotalSupplyHistoryResponse>(
    `${Endpoint.Venear}/total-supply-history?range=${range}`
  );
  return response.data;
};
