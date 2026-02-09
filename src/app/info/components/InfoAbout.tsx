import React from "react";
import Image from "next/image";
import Tenant from "@/lib/tenant/tenant";
import { CoinsIcon } from "@/assets/CoinsIcon";
import { rgbStringToHex } from "@/lib/color";
import { NotificationIcon } from "@/assets/NotificationIcon";
import { CheckCircleBrokenIcon } from "@/assets/CheckCircleBrokenIcon";

const { ui } = Tenant.current();

const tabs = [
  {
    icon: (
      <CoinsIcon
        className="w-[24px] h-[24px]"
        stroke={rgbStringToHex(ui.customization?.brandPrimary)}
      />
    ),
    title: "Delegate voting power",
    description:
      "The community is governed by its token holders, represented by trusted delegates.",
  },
  {
    icon: (
      <NotificationIcon
        className="w-[24px] h-[24px]"
        stroke={rgbStringToHex(ui.customization?.brandPrimary)}
      />
    ),
    title: "Browse proposals",
    description:
      "Token holders submit proposals that shape the priorities and direction of the community.",
  },
  {
    icon: (
      <CheckCircleBrokenIcon
        className="w-[24px] h-[24px]"
        stroke={rgbStringToHex(ui.customization?.brandPrimary)}
      />
    ),
    title: "Vote on proposals",
    description:
      "Eligible proposals go to a community vote where delegates and self-delegated token holders decide the outcome.",
  },
];

const InfoAbout = () => {
  const { ui } = Tenant.current();
  const page = ui.page("info/about");

  if (!page) {
    return <div></div>;
  }

  return (
    <>
      <h3 className="text-2xl font-black text-primary mt-12">
        Getting started
      </h3>
      <div className="mt-4 rounded-xl border border-line bg-neutral shadow-sm">
        <div className="p-6 flex flex-row flex-wrap sm:flex-nowrap gap-6">
          <div className="w-full h-[200px] sm:h-auto sm:w-1/2 relative">
            <Image
              src={page.hero!}
              alt={page.title}
              fill
              className="rounded-lg object-cover object-center"
            />
          </div>
        </div>
        <div className="p-6  rounded-b-xl bg-neutral border-t border-line">
          <div className="flex flex-row gap-6 flex-wrap sm:flex-nowrap mb-4">
            {tabs.map((item, index) => (
              <div
                key={index}
                className="flex flex-row gap-3 justify-center items-center mt-3"
              >
                <div className="min-w-[72px] h-[72px] flex justify-center items-center rounded-full border border-line bg-tertiary/10">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-primary">{item.title}</h3>
                  <p className="font-normal text-secondary">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoAbout;
