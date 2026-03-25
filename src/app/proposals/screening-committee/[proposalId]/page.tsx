import { ScreeningProposalExpansionPage } from "@/components/Proposals/InfoExpansion/ScreeningProposalExpansionPage";
import Tenant from "@/lib/tenant/tenant";

export { generateMetadata } from "@/app/info/page";

export default function ScreeningProposalExpansionRoute({
  params: { proposalId },
  searchParams,
}: {
  params: { proposalId: string };
  searchParams?: { openComments?: string };
}) {
  const { ui } = Tenant.current();

  if (!ui.toggle("info")?.enabled) {
    return (
      <div className="text-primary">Route not supported for namespace</div>
    );
  }

  return (
    <div className="flex flex-col">
      <ScreeningProposalExpansionPage
        proposalId={proposalId}
        openComments={searchParams?.openComments === "1"}
      />
    </div>
  );
}
