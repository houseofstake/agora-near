
## Getting Started

1. Git clone this repo
2. Hit up the [Discord](https://discord.com/invite/nearprotocol) and make sure that you get a local copy of the `.env.local` file. This is required to run the application locally. Then run the development server:
3. Run `yarn`
4. `yarn start` / `yarn start:dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Documentation

The API documentation is available via Swagger UI when running the development server:

- **API Docs UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **OpenAPI Spec**: [http://localhost:3000/openapi.json](http://localhost:3000/openapi.json)

The OpenAPI specification is located at `public/openapi.json` and documents all available REST API endpoints.

### Available Endpoints

- `GET /api/v1/proposals` - List approved proposals with pagination
  - Query params: `offset` (default: 0), `limit` (default: 20, max: 100)

## Environment Variables

This application uses several environment variables for configuration. A `.env.example` file is provided as a template.

### Required Public Variables

These variables are prefixed with `NEXT_PUBLIC_` and are exposed to the browser:

- **`NEXT_PUBLIC_AGORA_ENV`** - Environment selector (all use mainnet):
  - `prod` - Production environment with dedicated contracts and cloud API
  - `august-prod` - August production environment with dedicated contracts and cloud API
  - `staging` - Staging environment with dedicated contracts and cloud API
  - `dev` - Development environment with dedicated contracts and cloud API
  - `local` - Local development (uses `dev` contracts with localhost API)
- **`NEXT_PUBLIC_NEAR_LINEAR_TOKEN_CONTRACT_ID`** - Linear protocol LST (liquid staking token) contract
- **`NEXT_PUBLIC_NEAR_STNEAR_TOKEN_CONTRACT_ID`** - Meta Pool stNEAR LST contract

  **Note:** Contract IDs (veNEAR, voting, staking pool) are automatically configured based on this environment setting in `src/lib/contractConstants.ts`. For backwards compatibility, you can still override with individual env vars if needed.

### Optional Public Variables

- **`NEXT_PUBLIC_AGORA_ROOT`** - Custom root path; redirects `/` to this path if set (default: `/`)
- **`NEXT_PUBLIC_MAINTENANCE_MODE`** - Displays maintenance mode when set to `"true"`
- **`NEXT_PUBLIC_NEAR_QUORUM_THRESHOLD_PERCENTAGE`** - Percentage of total voting power required for quorum (default: `"0.35"` = 35%)
- **`NEXT_PUBLIC_NEAR_QUORUM_FLOOR_VENEAR`** - Minimum absolute veNEAR required for quorum (default: `"7000000"` = 7M veNEAR)
- **`NEXT_PUBLIC_GA_MEASUREMENT_ID`** - Google Analytics measurement ID for tracking

### Server-Side Variables

These are only available on the server/build side:

- **`NODE_ENV`** - Enables development features when set to `"development"`
- **`MIN_VERSION_FOR_LST_LOCKUP`** - Minimum lockup contract version that supports LST token locking

### Vercel Variables

These are automatically set by Vercel and used for OpenTelemetry instrumentation:

- `VERCEL_ENV`, `VERCEL_REGION`, `NEXT_RUNTIME`, `VERCEL_GIT_COMMIT_SHA`, `VERCEL_URL`, `VERCEL_BRANCH_URL`

## About this repo

You will find a mix of different styles at work in this repo. We are a small team and will be settling on standards in the coming months as we move more and more of the multi-tennant / instance style of Agora, into one codebase.

### Typescript vs. Javascript

You will see a mix of JS and TS. Don't be alarmed. TS was meant to bolster the productivity of Javascript engineers but sometimes, it can get in the way when you are doing something simple. As a general rule, we will want backend API code written in TypeScript and will eventually move the whole app over, but if some views start as JSX files, don't complain or hammer Discord. Learn to love the chaos.

### Styles and CSS

The application is using a combination of Tailwind, Emotion and native SCSS. Our old codebase relied exclusively on `emotion/css` in-line styles and you might see some relics of that form here but it's best to use the pattern shown in the Hero component as an example of how to write new code.

There are three theme files in this repo, but the goal will be to move 1 or 2 in the near future.

1. `@/styles/theme.js` -> This is the Javascript representation of the theme file and should be used only if you are porting old `emotion/css` components from the old repo.
2. `@/styles/variables.scss` -> This the same theme file expressed as SCSS variables so that we can import the theme into component level SCSS files more easily.
3. `tailwind.config.js` -> This is the Tailwind configuration file. We are using Tailwind for utility classes but still want the flexibility of native CSS so this allows us to import our theme into Tailwind.

If you add a new style to any of these files, you should duplicate them across all files.

### Building new components

Use `@/components/Hero` as the reference for this section to see how clean the template file is + the corresponding styles.

1. Think of a good name for your component
2. Navigate to the component tree and see if there is already a folder that semantically matches what your new comonent will do. If not, create one.
3. Duplicate the name of the folder as a JS/TSX file inside it. This will be your component.
4. Create a `<folder_name>.module.scss` file and name it with the same name as your component file. This will hold the styles.
5. Build your component
6. Use semantic HTML elements where appropirate and target styles using the class name
7. In your SCSS file, make sure that you import

### Global styles

There will be some styles that should be set as Global styles, if that is the case they should be prefixed with `gl_` and imported into `@/styles/globals.scss`.

### Using TailWind

The `HStack` and `VStack` components have been modified to support Tailwind directives. Everything is pretty similar except for two key details:

1. Gaps are now passed as ints instead of strings: ie, `gap={4}` instead of `gap="4"`
2. The justify and align directives use tailwind vs. standard CSS directives. Have a look at the `Stack.tsx` component to see how this is done and to see all available directives.

The main usage of direct Tailwind classes can be found in a single component

`@/components/Layout/PageContainer.tsx`

```jsx
import React, { ReactNode } from "react";

import { VStack } from "@/components/Layout/Stack";
import { Analytics } from "@vercel/analytics/react";

type Props = {
  children: ReactNode,
};

export function PageContainer({ children }: Props) {
  return (
    <div className="container my-4 mx-auto sm:px-8">
      <div className="gl_bg-dotted-pattern" />
      <div className="gl_bg-radial-gradient" />
      {children}
      <Analytics />
    </div>
  );
}
```

The rest of the time, you should be able to use standard SCSS directives along with the variables in the `@/styles/variables.scss` file.

## Understand the layout of the application

In NextJS there are a few key files and folders to understand:

`@/app`
This directory holds the primary application and each folder represents a different section of the app. So for example the `@/app/delegates` maps to: `https://app.example.com/delegates`

There is no Router.

The router is the directory structure of the `/app` directory.

Each folder contains a magical page called `page.jsx` or `page.jsx` this acts as the `index` page for the route. So for example `@/app/delegates/page.jsx` is the index page for `https://app.example.com/delegates`

`@app/lib`
Helpers and utilities, reserverd word.

`@app/layout.tsx`

This is the primary wrapper of the application, similar to the `index.html` page in a standard React app.

`@/app/page.jsx`

This is the index page of application

`@/app/api`

This is where all of the server functions will live. Anything that deals with the REST API, fetching data from the database etc, will live here.

`@/components`

This is where all of the React components will live that will be pulled into the pages and views.

`@/styles`

This is where all of the global styles and themes will live

`@/assets`

This is where all of the images, fonts, and other assets will live.

## Instrumentation + Observability

We have integrated [OpenTelemetry](https://opentelemetry.io/) (OTel) to aid in instrumenting the application. OTel is a vendor-agnostic observability providing a single set of APIs, libraries, agents, and instrumentation to capture distributed traces and metrics.

### Mixpanel Analytics

Basic analytics are wired through a lightweight client util at `src/lib/analytics/mixpanel.ts`.

- Set `NEXT_PUBLIC_MIXPANEL_TOKEN` in `.env.local`.
- Page views are automatically tracked via `MixpanelProvider` mounted in `src/app/Web3Provider.tsx`.
- Events fired:
  - "Started Lock and Stake" when opening the lock dialog
  - "Locked NEAR" or "Locked NEAR with LST" on lock submission
  - "Unlocked NEAR" on unlock submission
  - "Delegated" when opening delegate dialog
  - "Created Delegate Statement" on successful statement submit
  - "Proposal Created" on successful proposal creation
  - "Voted on Proposal" on successful vote

Create a separate token for prod and swap the env var for mainnet deployments.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Brand and Style Guide

This section documents the key colors and design tokens used throughout the application.

### Key Brand Colors

The NEAR House of Stake uses a minimal, monochromatic palette with accent colors for semantic states:

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **NEAR Mint** | `#00EC97` | `0 236 151` | Accent color, highlights, NEAR logo |
| **Brand Primary** | `#000000` | `0 0 0` | Primary text, brand elements, logos |
| **Brand Secondary** | `#FFFFFF` | `255 255 255` | Backgrounds, inverted elements |
| **Secondary** | `#404040` | `64 64 64` | Secondary text |
| **Tertiary** | `#737373` | `115 115 115` | Muted text, placeholders |
| **Wash** | `#FAFAFA` | `250 250 250` | Card backgrounds, subtle fills |
| **Line** | `#E5E5E5` | `229 229 229` | Borders, dividers |

### Semantic Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Positive** | `#61D161` | Success states, positive indicators |
| **Negative** | `#E23636` | Error states, negative indicators |
| **Vote For** | `#06AB34` | "For" votes on proposals |
| **Vote Against** | `#D62600` | "Against" votes on proposals |
| **Vote Abstain** | `#AFAFAF` | "Abstain" votes on proposals |

### Agora Stone Scale

A neutral gray scale used across UI components:

| Token | Hex | Usage |
|-------|-----|-------|
| `agora-stone-900` | `#000000` | Darkest (black) |
| `agora-stone-700` | `#4F4F4F` | Dark gray |
| `agora-stone-500` | `#AFAFAF` | Medium gray |
| `agora-stone-100` | `#E0E0E0` | Light gray |
| `agora-stone-50` | `#FAFAFA` | Lightest (near white) |

### Typography

- **Primary Font**: Inter (system fallback stack)
- **Monospace Font**: Chivo Mono (used for token amounts)
- **Code Font**: IBM Plex Mono

### Where Colors Are Defined

Colors are synchronized across three files (see "Styles and CSS" section above):
1. `tailwind.config.js` - Tailwind theme extension
2. `src/styles/theme.js` - JavaScript theme object for emotion/css
3. `src/styles/variables.scss` - SCSS variables

Tenant-specific customizations (like NEAR colors) are defined in `src/lib/tenant/configs/ui/near.ts`.

## How Data is Stored: On-Chain vs Off-Chain

This section explains what happens to data in this application, written for non-technical users.

### Understanding Blockchain vs Database Storage

When using House of Stake, user actions are recorded in two places:

- **On-chain (blockchain)**: Data stored permanently on the NEAR blockchain. This data is public, transparent, and cannot be changed or deleted by anyone.
- **Off-chain (database)**: Data stored in a production postgres database. This enables fast searching and rich features, but isn't part of the blockchain itself. 

### What Gets Stored On-Chain

The following information is written to the NEAR blockchain and stored forever:

**Voting Power (veNEAR)**
- Locked NEAR balance and accrued voting power
- How voting power grows over time while locked
- The total voting power across all participants

**Delegation**
- Who has been delegated voting power (if anyone)
- When delegations happen

**Proposals**
- The proposal ID, creator, and creation timestamp
- Voting options (e.g., "Yes", "No", "Abstain")
- Proposal status (pending, voting, finished, rejected)
- The final vote tallies for each option
- A cryptographic snapshot of all eligible voters at voting start

**Votes**
- Which proposal has been voted on
- Which option what chose
- Voting power at the time of voting
- Cryptographic proof

**Locking and Unlocking NEAR**
- When NEAR is locked to receive veNEAR
- When unlocking begins (starts a waiting period)
- When an unlock is completed and NEAR is withdrawn
- Which staking pool has been selected (if staking)

### What Gets Stored Off-Chain (Database)

The following is stored in our database for faster access and richer features:

**Proposal Details**
- Proposal titles, descriptions, and external links
- Cached voting results (synced from blockchain for faster loading)
- Voting history searchable by voter
- Lists of eligible voters who haven't voted yet

**Draft Proposals**
- Proposals that have been written but not yet submitted
- These remain private until submitted to the blockchain

**Delegate Profiles**
- Delegate statements (what delegates stand for)
- Social links (Twitter, Discord, email, Warpcast)
- Top issues and priorities
- Notification preferences (email alerts for proposals)
- Aggregated voting statistics (participation rate, vote counts)

**Supporting Data**
- Transaction receipt lookups
- Staking pool APY rates
- Current NEAR price

### Why Use Both?

| Storage Type | Benefits | Trade-offs |
|-------------|----------|------------|
| **Blockchain** | Transparent, tamper-proof, decentralized | Slower, costs gas fees, limited query options |
| **Database** | Fast searches, rich filtering, no fees | Requires trust in the operator, not immutable |

We use blockchain storage for anything that requires trust and permanence (votes, balances, proposals), and database storage for features that need speed and flexibility (search, profiles, drafts).

### Summary by Action

| Action | Stored on-chain | Stored off-chain |
|--------|----------------|------------------|
| **Lock NEAR** | Locked balance and lock timestamp | — |
| **Delegate** | Delegation target | Delegate's profile (for display) |
| **Create a proposal** | Proposal ID, options, deposit | Title, description, links |
| **Vote** | Vote choice and voting power | Vote indexed for search |
| **Write delegate statement** | — | Statement and social links |
| **Save draft proposal** | — | Draft content (until submitted) |

### Audits

* [2026-01-16 - House Of Stake
Super Majority Voting
Security Review Report](./audits/2026-01-16-Super_Majority_v1.1.pdf)