import DelegateStatementInputGroup from "./DelegateStatementInputGroup";

import Tenant from "@/lib/tenant/tenant";
import { type UseFormReturn } from "react-hook-form";
import { type DelegateStatementFormValues } from "./CurrentDelegateStatement";
import DelegateStatementBoolSelector from "./DelegateStatementBoolSelector";
import NotificationSelector from "./NotificationSelector";

export default function OtherInfoFormSection({
  form,
  hideOffChainFields = false,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
  hideOffChainFields?: boolean;
}) {
  const { ui } = Tenant.current();
  const requireCodeOfConduct = ui.toggle("delegates/code-of-conduct")?.enabled;
  const supportsNotifications = ui.toggle("email-subscriptions")?.enabled;

  return (
    <div className="py-8 px-6 border-b border-line">
      <h3 className="font-bold text-primary">Other info</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
        {!hideOffChainFields && (
          <>
            <DelegateStatementInputGroup
              title="X (formerly Twitter)"
              placeholder="@yourname"
              name="twitter"
              form={form}
            />
            <DelegateStatementInputGroup
              title="Telegram"
              placeholder="@yourname"
              name="warpcast"
              form={form}
            />
            <DelegateStatementInputGroup
              title="Email (will not be public)"
              placeholder="you@gmail.com"
              name="email"
              form={form}
            />
          </>
        )}
        <div className="col-span-full">
          {requireCodeOfConduct && (
            <DelegateStatementBoolSelector form={form} />
          )}
          {supportsNotifications && !hideOffChainFields && (
            <NotificationSelector form={form} />
          )}
        </div>
      </div>
    </div>
  );
}
