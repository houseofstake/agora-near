import React, { Suspense } from "react";
import AgoraLoader from "@/components/shared/AgoraLoader/AgoraLoader";
import ApiKeysManager from "@/components/ApiKeys/ApiKeysManager";

export async function generateMetadata() {
  return {
    title: "API Keys | HoS NEAR",
    description: "Manage your Developer API Keys for the Agora platform.",
  };
}

export default async function Page() {
  return (
    <section>
      <Suspense fallback={<AgoraLoader />}>
        <div className="mx-auto max-w-[76rem] px-4 sm:px-0 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary">API Keys</h1>
            <p className="mt-2 text-secondary">
              Manage your Developer API Keys for the Agora platform.
            </p>
          </div>
          <ApiKeysManager />
        </div>
      </Suspense>
    </section>
  );
}
