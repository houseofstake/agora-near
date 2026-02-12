import { JsonRpcProvider } from "@near-js/providers";
import { getRpcUrl } from "@/lib/utils";
import { DelegateProfile } from "@/lib/api/delegates/types";

// Constants
const SOCIAL_CONTRACT_ID = "social.near";

/**
 * Mapped interface from NEAR Social profile structure
 */
interface NearSocialProfile {
  name?: string;
  description?: string;
  image?: {
    ipfs_cid?: string;
    url?: string;
  };
  linktree?: {
    twitter?: string;
    github?: string;
    telegram?: string;
    website?: string;
  };
  // other fields exist but we map specifically to DelegateProfile
}

export const fetchSocialProfile = async (
  accountId: string
): Promise<Partial<DelegateProfile> | null> => {
  try {
    const rpcUrl = getRpcUrl("mainnet");
    const provider = new JsonRpcProvider({ url: rpcUrl });

    const key = `${accountId}/profile/**`;
    
    // Call social.near get method
    const result = await provider.query({
      request_type: "call_function",
      finality: "optimistic",
      account_id: SOCIAL_CONTRACT_ID,
      method_name: "get",
      args_base64: Buffer.from(JSON.stringify({ keys: [key] })).toString("base64"),
    });

    const res: any = result;
    const resultArray = res?.result;

    if (!resultArray) {
      return null;
    }

    const value = JSON.parse(Buffer.from(resultArray).toString());

    // value structure is { [accountId]: { profile: ... } }
    const profileData: NearSocialProfile = value?.[accountId]?.profile;

    if (!profileData) {
      return null;
    }

    // Map to DelegateProfile partial
    const mappedProfile: Partial<DelegateProfile> = {};

    if (profileData.description) {
      mappedProfile.statement = profileData.description;
    }
    
    if (profileData.linktree?.twitter) {
      mappedProfile.twitter = profileData.linktree.twitter;
    }

    return mappedProfile;

  } catch (error) {
    console.warn(`Error fetching social profile for ${accountId}`, error);
    return null;
  }
};
