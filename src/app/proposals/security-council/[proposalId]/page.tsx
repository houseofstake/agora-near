import { SecurityCouncilProposalExpansionPage } from "@/components/Proposals/InfoExpansion/SecurityCouncilProposalExpansionPage";
import Tenant from "@/lib/tenant/tenant";

export { generateMetadata } from "@/app/info/page";

export default function SecurityCouncilProposalExpansionRoute({
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
      <SecurityCouncilProposalExpansionPage
        proposalId={proposalId}
        openComments={searchParams?.openComments === "1"}
      />
    </div>
  );
}
