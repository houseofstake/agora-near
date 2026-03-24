import { baseApiUrl } from "../constants";

export async function getGlobalAnalytics() {
  const res = await fetch(`${BASE_URL}/v1/analytics/global`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NEXT_PUBLIC_AGORA_API_KEY || "agora-dev-key", // standard fallback
    },
    next: { revalidate: 3600 }, // Cache statically for 1 hour to prevent DB spam
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch global analytics: ${res.status}`);
  }
  
  return res.json();
}

export async function getProposalAnalytics(proposalId: string) {
  const res = await fetch(`${BASE_URL}/v1/analytics/proposal/${proposalId}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NEXT_PUBLIC_AGORA_API_KEY || "agora-dev-key",
    },
    next: { revalidate: 3600 },
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch proposal analytics: ${res.status}`);
  }
  
  return res.json();
}
