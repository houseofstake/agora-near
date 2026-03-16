import React from "react";
import { GovernanceProcess } from "@/app/info/components/GovernanceProcess";
import InfoVideos from "@/app/info/components/InfoVideos";
import { InfoScopeAndParams } from "@/app/info/components/InfoScopeAndParams";
import Tenant from "@/lib/tenant/tenant";
import { InfoHero } from "./components/InfoHero";
import InfoRoadmap from "./components/InfoRoadmap";

export async function generateMetadata() {
  const tenant = Tenant.current();
  const page = tenant.ui.page("info") || tenant.ui.page("/");

  const { title, description } = page!.meta;

  const preview = `/api/images/og/generic?title=${encodeURIComponent(
    title
  )}&description=${encodeURIComponent(description)}`;

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

export default async function Page() {
  const { ui } = Tenant.current();

  if (!ui.toggle("info")?.enabled) {
    return (
      <div className="text-primary">Route not supported for namespace</div>
    );
  }

  return (
    <div className="flex flex-col">
      <InfoHero />
      <GovernanceProcess />
      <InfoScopeAndParams />
      <InfoVideos />
      <InfoRoadmap />
    </div>
  );
}
