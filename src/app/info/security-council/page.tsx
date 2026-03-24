import { SecurityCouncil } from "@/components/Info/committee/SecurityCouncil/SecurityCouncil";
import Tenant from "@/lib/tenant/tenant";

export { generateMetadata } from "../page";

export default function SecurityCouncilPage() {
  const { ui } = Tenant.current();

  if (!ui.toggle("info")?.enabled) {
    return (
      <div className="text-primary">Route not supported for namespace</div>
    );
  }

  return (
    <div className="flex flex-col">
      <SecurityCouncil />
    </div>
  );
}

