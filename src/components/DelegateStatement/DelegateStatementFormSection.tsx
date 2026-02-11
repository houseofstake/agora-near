import Markdown from "@/components/shared/Markdown/Markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormField } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type UseFormReturn, useWatch } from "react-hook-form";
import {
  DELEGATE_PROFILE_LIMITS,
  type DelegateStatementFormValues,
} from "./CurrentDelegateStatement";
import Tenant from "@/lib/tenant/tenant";
import { FormEvent } from "react";

export default function DelegateStatementFormSection({
  form,
  showDisplayName = false,
}: {
  form: UseFormReturn<DelegateStatementFormValues>;
  showDisplayName?: boolean;
}) {
  const delegateStatement = useWatch({ name: "delegateStatement" });
  const { ui } = Tenant.current();

  const templateLink = ui.link("delegate-statement-template");

  const addDefaultValueOnFocus = (e: FormEvent) => {
    if ((e.target as HTMLInputElement).value === "") {
      (e.target as HTMLInputElement).value = defaultValue;
    }
  };

  // Keep this value multiline
  const defaultValue = `A brief intro to yourself:

A message to the community and ecosystem:

Discourse username:`;

  return (
    <div className="flex flex-col py-8 px-6 border-b border-line text-primary">
      {showDisplayName && (
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <Label variant="black" className="mb-6">
              <h4 className="font-semibold text-xs mb-1 text-secondary">
                Display name (on-chain)
              </h4>
              <Input
                variant="bgGray100"
                inputSize="md"
                placeholder="How should your name appear?"
                maxLength={DELEGATE_PROFILE_LIMITS.displayName}
                {...field}
              />
            </Label>
          )}
        />
      )}
      <Tabs defaultValue="write">
        <div className="flex flex-row gap-4 justify-between items-baseline">
          <div className="flex flex-row items-baseline gap-2">
            <h3 className="font-bold">Delegate statement</h3>
            {templateLink && (
              <a href={templateLink.url} rel="noreferrer" target="_blank">
                <p className="text-sm opacity-50">{templateLink.title}</p>
              </a>
            )}
          </div>
          <TabsList className="gap-0">
            <TabsTrigger variant="gray" className="text-sm" value="write">
              Write
            </TabsTrigger>
            <TabsTrigger variant="gray" className="text-sm" value="preview">
              Preview
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="write">
          <FormField
            control={form.control}
            name="delegateStatement"
            render={({ field }) => (
              <Textarea
                className="mt-2 min-h-[16rem]"
                onFocus={addDefaultValueOnFocus}
                placeholder={defaultValue}
                maxLength={DELEGATE_PROFILE_LIMITS.delegateStatement}
                {...field}
              />
            )}
          />
        </TabsContent>
        <TabsContent value="preview">
          <Markdown content={delegateStatement} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
