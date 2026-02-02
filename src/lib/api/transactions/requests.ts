import axios from "axios";
import { Endpoint } from "../constants";
import { GetTransactionHashResponse } from "./types";

export const getTransactionHash = async ({
  networkId,
  receiptId,
}: {
  networkId: string;
  receiptId: string;
}) => {
  const response = await axios.get<GetTransactionHashResponse>(
    `${Endpoint.Transactions}/hash?network_id=${networkId}&receipt_id=${receiptId}`
  );

  return response.data;
};
