const getApiUrl = () => {
  switch (process.env.NEXT_PUBLIC_AGORA_ENV) {
    case "prod":
      return "https://near-api-fdj2gc3hbq-uw.a.run.app/api"; // hos-gov-prd
    case "august-prod":
      return "https://near-api-237405837378.us-west1.run.app/api"; // agora-near-25q2
    case "staging":
      return "https://near-api-bherpz2buq-uw.a.run.app/api"; // hos-gov-stg
    case "dev":
      return "https://near-api-g4qvzlnzwq-uw.a.run.app/api"; // hos-gov-dev
    case "local":
      return "http://localhost:8080/api";
    default:
      throw new Error(
        `Unknown NEXT_PUBLIC_AGORA_ENV: ${process.env.NEXT_PUBLIC_AGORA_ENV}, so API is unknown.`
      );
  }
};

export const baseApiUrl = getApiUrl();

export const Endpoint = Object.freeze({
  Venear: `${baseApiUrl}/venear`,
  Proposals: `${baseApiUrl}/proposal`,
  DraftProposals: `${baseApiUrl}/proposal/draft`,
  DelegateStatement: `${baseApiUrl}/delegates/statement`,
  Delegates: `${baseApiUrl}/delegates`,
  Near: `${baseApiUrl}/near`,
  Staking: `${baseApiUrl}/staking`,
  Nonce: `${baseApiUrl}/nonce`,
  Transactions: `${baseApiUrl}/transactions`,
  DelegateStatementChanges: `${baseApiUrl}/delegate_statement_changes`,
  VotingPowerChart: `${baseApiUrl}/get_voting_power_chart`,
  VoteChanges: `${baseApiUrl}/vote_changes`,
});
