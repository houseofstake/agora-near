import { ScreeningCommittee } from "@/components/Info/committee/ScreeningCommittee/ScreeningCommittee";
import Tenant from "@/lib/tenant/tenant";

export { generateMetadata } from "../page";

export default function ScreeningCommitteePage() {
  const { ui } = Tenant.current();

  if (!ui.toggle("info")?.enabled) {
    return (
      <div className="text-primary">Route not supported for namespace</div>
    );
  }

  return (
    <div className="flex flex-col">
      <ScreeningCommittee />
    </div>
  );
}

