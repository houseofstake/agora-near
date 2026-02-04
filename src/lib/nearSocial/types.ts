export type TopIssue = {
  type: string;
  value: string;
};

export type NearSocialProfile = {
  name?: string | null;
  statement?: string | null;
  topIssues?: Record<string, string> | TopIssue[] | string | null;
  codeOfConductSigned?: "Signed" | null;
};
