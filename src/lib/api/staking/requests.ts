import axios from "axios";
import { Endpoint } from "../constants";

export const getStakingPoolApy = async ({
  networkId,
  contractId,
}: {
  networkId: string;
  contractId: string;
}) => {
  const response = await axios.get<{
    apy: number;
  }>(`${Endpoint.Staking}/apy?networkId=${networkId}&contractId=${contractId}`);

  return response.data;
};
