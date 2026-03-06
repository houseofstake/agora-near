import nearLogo from "@/assets/near_logo.svg";
import infoPageCard00 from "@/assets/info_0.png";
import infoPageCard01 from "@/assets/info_1.png";
import infoPageCard02 from "@/assets/info_2.png";
import { TenantUI } from "@/lib/tenant/tenantUI";

export const nearTenantUIConfig = new TenantUI({
  title: "",
  logo: nearLogo,
  hideAgoraBranding: false,
  hideAgoraFooter: true,

  assets: {
    success: nearLogo,
    pending: nearLogo,
    delegate: nearLogo,
  },

  governanceIssues: [
    {
      icon: "piggyBank",
      title: "Funding and grants",
      key: "fundingAndGrants",
    },
    {
      icon: "community",
      title: "House of Stake",
      key: "houseOfStake",
    },
  ],

  customization: {
    primary: "0 0 0",
    secondary: "64 64 64",
    tertiary: "115 115 115",
    neutral: "255 255 255",
    wash: "250 250 250",
    line: "229 229 229",
    positive: "97 209 97",
    negative: "226 54 54",
    brandPrimary: "0 0 0",
    brandSecondary: "255 255 255",
    tokenAmountFont: "font-chivoMono",
  },

  links: [
    {
      name: "github",
      title: "GitHub",
      url: "https://github.com/houseofstake",
    },
    {
      name: "twitter",
      title: "Twitter",
      url: "https://x.com/NEARGovernance",
    },
    {
      name: "telegram",
      title: "Telegram",
      url: "https://t.me/NEAR_HouseOfStake",
    },
    // {
    //   name: "blog",
    //   title: "Blog",
    //   url: "https://houseofstake.org/blog#",
    // },
    {
      name: "discord",
      title: "Discord",
      url: "https://discord.gg/nearprotocol",
    },
    {
      name: "bugs",
      title: "Report bugs & feedback",
      url: "https://t.me/near_hos_support",
    },
    {
      name: "governance-forum",
      title: "Governance Forum",
      url: "https://gov.near.org/",
    },
    {
      name: "code-of-conduct",
      title: "Delegate Code of Conduct",
      url: "https://houseofstake.org/docs/structure/delegates-and-participants/",
    },
    {
      name: "delegate-statement-template",
      title: "View Template",
      url: "https://gov.near.org/t/near-call-for-delegates-house-of-stake/40513",
    },
  ],

  pages: [
    {
      route: "/",
      title: "House of Stake is the home of NEAR voters",
      description:
        "NEAR House of Stake governance empowers token holders to lock NEAR for voting rights, and delegate votes to trusted representatives.",
      meta: {
        title: "NEAR Agora",
        description: "Home of the NEAR House of Stake governance",
        imageTitle: "NEAR Agora",
        imageDescription: "Home of the NEAR House of Stake governance",
      },
    },
    {
      route: "proposals",
      title: "House of Stake is the home of NEAR voters",
      description:
        "NEAR House of Stake governance empowers token holders to lock NEAR for voting rights, and delegate votes to trusted representatives.",
      meta: {
        title: "NEAR Proposals | House of Stake Governance",
        description:
          "View and vote on active NEAR governance proposals. Participate in on-chain governance decisions that shape the future of the NEAR ecosystem.",
        imageTitle: "NEAR Proposals",
        imageDescription: "View and vote on active NEAR governance proposals",
      },
    },
    {
      route: "delegates",
      title: "House of Stake is the home of NEAR voters",
      description:
        "NEAR House of Stake governance empowers token holders to lock NEAR for voting rights, and delegate votes to trusted representatives.",
      meta: {
        title: "NEAR Voters | Delegate Your Voting Power",
        description:
          "Browse and delegate your voting power to trusted NEAR governance representatives. View voter statements, voting history, and track delegated power.",
        imageTitle: "NEAR Voters",
        imageDescription:
          "Delegate your voting power to trusted NEAR governance representatives",
      },
    },
    {
      route: "assets",
      title: "House of Stake is the home of NEAR voters",
      description:
        "NEAR House of Stake governance empowers token holders to lock NEAR for voting rights, and delegate votes to trusted representatives.",
      meta: {
        title: "NEAR Assets | Lock & Stake Your Tokens",
        description:
          "Manage your NEAR governance assets. Lock NEAR tokens, stake with liquid staking protocols like LiNEAR and stNEAR, and earn voting power.",
        imageTitle: "NEAR Assets",
        imageDescription:
          "Lock & stake NEAR tokens to participate in governance",
      },
    },
    {
      route: "info",
      title: "Welcome to the House of Stake",
      description:
        "House of Stake is the home of NEAR governance, powered by Agora. NEAR token holders lock tokens for voting rights, delegate votes to trusted representatives, and participate in shaping the future of the NEAR ecosystem.",
      meta: {
        title: "About NEAR House of Stake | Governance Info",
        description:
          "Learn how NEAR House of Stake governance works. Discover voting mechanics, token locking, delegation, and how to participate in shaping the NEAR ecosystem.",
        imageTitle: "About NEAR House of Stake",
        imageDescription: "Learn how NEAR governance works",
      },
      links: [
        {
          name: "Governance Forums",
          title: "Governance Forums",
          url: "https://gov.near.org/",
          image: infoPageCard01,
        },
        {
          name: "House of Stake Docs",
          title: "House of Stake Docs",
          url: "https://houseofstake.org/",
          image: infoPageCard02,
        },
        {
          name: "Community Discord",
          title: "Community Discord",
          url: "https://discord.gg/nearprotocol",
          image: infoPageCard00,
        },
      ],
    },
  ],

  toggles: [
    {
      name: "admin",
      enabled: false,
    },
    {
      name: "proposals",
      enabled: true,
    },
    {
      name: "proposals/create",
      enabled: true,
    },
    {
      name: "delegates",
      enabled: true,
    },
    {
      name: "delegates/code-of-conduct",
      enabled: true,
    },
    {
      name: "delegates/edit",
      enabled: true,
    },
    {
      name: "info",
      enabled: true,
    },
    {
      name: "proposal-execute",
      enabled: false,
    },
    {
      name: "email-subscriptions",
      enabled: true,
    },
    {
      name: "proposal-lifecycle",
      enabled: false,
    },
    {
      name: "assets",
      enabled: true,
    },
    {
      name: "delegation-encouragement",
      enabled: true,
    },
    {
      name: "delegation-encouragement-wallet",
      enabled: false,
    },
  ],
});
