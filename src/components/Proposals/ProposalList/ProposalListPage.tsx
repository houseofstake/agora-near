import Tenant from "@/lib/tenant/tenant";
import ProposalList from "@/components/Proposals/ProposalList/ProposalList";
import Hero from "@/components/Hero/Hero";
import SubscribeDialogLauncher from "@/components/Notifications/SubscribeDialogLauncher";

export default async function ProposalListPage() {
  const { ui } = Tenant.current();
  const supportsNotifications = ui.toggle("email-subscriptions")?.enabled;

  if (!ui.toggle("proposals")) {
    return <div>Route not supported for namespace</div>;
  }

  return (
    <div className="flex flex-col">
      {supportsNotifications && <SubscribeDialogLauncher />}
      <Hero page="proposals" />
      <ProposalList />
    </div>
  );
}
