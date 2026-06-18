"use client";

import { InfoClockIcon } from "@/components/Info/shared/InfoClockIcon/InfoClockIcon";

type Member = {
  initials: string;
  name: string;
  subtitle: string;
};

type InfoMembersSidebarProps = {
  title: string;
  members: Member[];
  footerText: string;
};

export const InfoMembersSidebar = ({
  title,
  members,
  footerText,
}: InfoMembersSidebarProps) => {
  return (
    <aside className="w-full max-w-sm space-y-4 lg:w-80">
      <div className="rounded-2xl border border-line bg-neutral shadow-newDefault">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-primary">{title}</h2>
            <p className="text-xs text-tertiary">{members.length} members</p>
          </div>
        </div>

        <div className="max-h-[420px] divide-y divide-line overflow-y-auto">
          {members.map((member) => (
            <div
              key={member.name}
              className="flex items-center gap-3 px-5 py-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-neutral">
                {member.initials}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">
                  {member.name}
                </p>
                <p className="text-xs text-tertiary">{member.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-line bg-wash px-5 py-4 text-xs text-tertiary">
          <div className="flex items-start gap-2">
            <InfoClockIcon className="mt-[2px]" />
            <p className="leading-relaxed">{footerText}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
