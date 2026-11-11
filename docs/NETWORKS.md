# Networks: the testnet / mainnet switch

In plain terms: the dashboard shows one network at a time, and a **Testnet | Mainnet** switch in the top bar picks
which one. Testnet shows the live stats from the staging relayer. Mainnet isn't live yet, so its page says it's
coming soon and links back to the testnet stats. When mainnet launches, one environment variable switches it on and
no code changes.

## The two networks

| | Testnet | Mainnet |
| --- | --- | --- |
| Route | `/` (default) and `/testnet` | `/mainnet` |
| Stats API | `STATS_API_URL_TESTNET`, falling back to `STATS_API_URL`, then `https://api-staging.pfbridge.xyz` | `STATS_API_URL_MAINNET`, falling back to `https://api.pfbridge.xyz` |
| App link | `https://staging.pfbridge.xyz` (`APP_URL_TESTNET`) | `https://app.pfbridge.xyz` (`APP_URL_MAINNET`) |
| Live | always | only when `MAINNET_LIVE=true` |

`STATS_API_URL` keeps working as the testnet fallback, so today's deploys don't change.

## Decisions

- **D1: config in one place.** `src/lib/config.ts` exports `NETWORKS: Record<"testnet" | "mainnet", Network>` with
  `{ id, label, statsApiUrl, appUrl, live }`, and a `getNetwork(id)` that reads the environment on the server. No
  other file reads these variables.
- **D2: the switch is links, not a toggle widget.** `NetworkSwitch` (in `components/layout`) renders two links in the
  top bar and marks the current one with `aria-current="page"`. The page still has no client JavaScript, and each
  network has its own shareable URL.
- **D3: one page component.** `src/app/page.tsx` renders testnet, and `src/app/[network]/page.tsx` renders
  `testnet` or `mainnet`. Any other value is a 404, set up with `generateStaticParams` and `dynamicParams = false`.
  Both use a shared `NetworkPage` component, which takes the network.
- **D4: a mainnet that isn't live never calls an API.** It renders `ComingSoon`: "Mainnet is coming soon", one plain
  line, and a **View our testnet stats** button that links to `/testnet`. It is not the "stats unavailable" error
  state.
- **D5: links follow the network.** The page's "open the app" links use that network's `appUrl`.
- **D6: soak pages stay testnet.** `/soak/[id]` and its CSVs always use the testnet stats API, because the snapshots
  come from the testnet soak. They aren't switched.
- **D7: behaviour on `/` doesn't change.** `/` still renders testnet. The only differences are the switch in the
  top bar and the app link on the page.

## Checks

- Specs for `getNetwork`: the defaults, the fallback order for the testnet URL, `MAINNET_LIVE` parsing (only `true`
  turns it on), and an unknown id. Specs for the switch's links and `aria-current`. All mutation-proved.
- A rendered check against a fake relayer:
  - `/` and `/testnet` show the same stats;
  - `/mainnet` shows the coming-soon card and makes **no** request to the relayer;
  - with `MAINNET_LIVE=true`, `/mainnet` shows stats from the mainnet URL;
  - `/foo` is a 404.
- `pnpm test` and `STATS_API_URL=http://127.0.0.1:9 pnpm build` pass.
