export type TopIssue = {
  type: string;
  value: string;
};

export type NearSocialProfile = {
  name?: string;
  statement?: string;
  topIssues?: Record<string, string> | TopIssue[];
  codeOfConductSigned?: "Signed";
};
