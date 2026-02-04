"use client";

import { FC, PropsWithChildren } from "react";
import Footer from "@/components/Footer";
import { PageContainer } from "@/components/Layout/PageContainer";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";
import { NearProvider } from "@/contexts/NearContext";
import { MixpanelProvider } from "@/components/Analytics/MixpanelProvider";
import { AnalyticsListener } from "@/components/Analytics/AnalyticsListener";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const { ui, networkId } = Tenant.current();
const shouldHideAgoraFooter = ui.hideAgoraFooter;

const Web3Provider: FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <NearProvider networkId={networkId}>
      <>
        <AnalyticsListener />
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <MixpanelProvider>
          <PageContainer>
            <Toaster position="bottom-right" />
            {children}
          </PageContainer>
        </MixpanelProvider>
        {!shouldHideAgoraFooter && <Footer />}
        <SpeedInsights />
      </>
    </NearProvider>
  </QueryClientProvider>
);

export default Web3Provider;
