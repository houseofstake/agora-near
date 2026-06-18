type ContractConfig = {
  VENEAR_CONTRACT_ID: string;
  VOTING_CONTRACT_ID: string;
};

const getContractConfig = (): ContractConfig => {
  // Fallback to env vars if provided (for backwards compatibility during migration)
  const envContractId = process.env.NEXT_PUBLIC_NEAR_CONTRACT_ID ?? "";
  const envVotingContractId =
    process.env.NEXT_PUBLIC_NEAR_VOTING_CONTRACT_ID ?? "";

  // If env vars are set, use them (backwards compatibility)
  if (envContractId || envVotingContractId) {
    return {
      VENEAR_CONTRACT_ID: envContractId,
      VOTING_CONTRACT_ID: envVotingContractId,
    };
  }

  const DEV_VENEAR_CONTRACT_ID = "vt.voteagora.near";
  const DEV_VOTING_CONTRACT_ID = "vote-dev.voteagora.near";

  // Otherwise, use environment-specific config
  switch (process.env.NEXT_PUBLIC_AGORA_ENV) {
    case "prod":
      return {
        VENEAR_CONTRACT_ID: "venear.dao",
        VOTING_CONTRACT_ID: "vote.dao",
      };
    case "august-prod":
      return {
        VENEAR_CONTRACT_ID: "v.voteagora.near", // v.hos-07.testnet (old dev)
        VOTING_CONTRACT_ID: "vote.voteagora.near", // vote.hos-07.testnet (old dev)
      };
    case "staging":
      return {
        VENEAR_CONTRACT_ID: "venear.stagingdao.near",
        VOTING_CONTRACT_ID: "vote.stagingdao.near",
      };
    case "dev":
      return {
        VENEAR_CONTRACT_ID: DEV_VENEAR_CONTRACT_ID,
        VOTING_CONTRACT_ID: DEV_VOTING_CONTRACT_ID,
      };
    case "local":
      return {
        VENEAR_CONTRACT_ID: DEV_VENEAR_CONTRACT_ID,
        VOTING_CONTRACT_ID: DEV_VOTING_CONTRACT_ID,
      };
    default:
      return {
        VENEAR_CONTRACT_ID: DEV_VENEAR_CONTRACT_ID,
        VOTING_CONTRACT_ID: DEV_VOTING_CONTRACT_ID,
      };
  }
};

export const CONTRACTS = getContractConfig();
