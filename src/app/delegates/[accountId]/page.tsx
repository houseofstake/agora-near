import { Metadata } from "next";

import { DelegateProfileContent } from "@/components/Delegates/DelegateProfile/DelegateProfileContent";
import { getDelegate } from "@/lib/api/delegates/requests";
import { formatNumber } from "@/lib/utils";
import { NEAR_TOKEN } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { accountId: string };
}): Promise<Metadata> {
  const address = params.accountId;
  const { networkId } = Tenant.current();

  const delegateProfile = await getDelegate(address, networkId);

  const statement = delegateProfile?.statement;
  const votingPower = delegateProfile?.votingPower;

  const imgParams = [
    votingPower &&
      `votes=${encodeURIComponent(
        `${formatNumber(votingPower || "0", NEAR_TOKEN.decimals)} veNEAR`
      )}`,
    statement && `statement=${encodeURIComponent(statement)}`,
  ].filter(Boolean);

  const preview = `/api/images/og/delegate?${imgParams.join(
    "&"
  )}&address=${address}`;

  const title = `${address} on Agora`;
  const description = `See what ${address} believes and how they vote on NEAR governance.`;

  return {
    title: title,
    description: description,
    openGraph: {
      images: [
        {
          url: preview,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function Page({ params }: { params: { accountId: string } }) {
  const address = params.accountId;

  return <DelegateProfileContent address={address} />;
}
