# ProofBridge dashboard

This is the public dashboard at **[dashboard.pfbridge.xyz](https://dashboard.pfbridge.xyz)**. It shows ProofBridge
network stats over a rolling 30 days: bridges completed, dispute outcomes, proof-generation and settlement time,
daily bridges and volume per token.

In plain terms: the page asks the ProofBridge relayer for its public network numbers once a minute and shows them.
It holds no keys, needs no sign-in and runs no JavaScript in the visitor's browser.

This app used to live in the [ProofBridge monorepo](https://github.com/Explore-Beyond-Innovations/ProofBridge) under
`apps/dashboard`, and its history came with it.

## Data

There is a single source: the relayer's public `GET /v1/stats/network?range=30d` endpoint. It needs no auth, and the
relayer caches it for 60 s.

| Tile | Field |
| --- | --- |
| Bridges completed, plus the completion rate | `trades.completed`, `trades.completionRate` |
| Proof generation (median) | `proving.medianProveMs` |
| Settlement time (median), plus its buckets | `settlement.medianSeconds`, `settlement.buckets` |
| Daily bridges | `daily[]` (a day with no bridges shows as 0) |
| Dispute outcomes | `disputes` (`Resolved` means it ended with no ruling and fell back to a refund) |
| Volume per token, in the token's own units | `volume[]`, with `decimals` |

If the API can't be reached or returns something unexpected, every tile shows "—" and the top bar says "Stats
unavailable right now". The page itself never fails.

## Networks

The top bar has a **Testnet | Mainnet** switch. It is two plain links, so each network has its own URL.

| Route | What it shows |
| --- | --- |
| `/` and `/testnet` | The testnet stats. |
| `/mainnet` | "Mainnet is coming soon" and a link to the testnet stats, until `MAINNET_LIVE=true`. Then the mainnet stats. |

Any other first path segment is a 404. While mainnet isn't live, its page never calls a relayer. The soak pages
always read the testnet relayer, because the snapshots come from the testnet soak. The pages read the variables when
they are rebuilt, so a change shows up within a minute of a restart. [`docs/NETWORKS.md`](docs/NETWORKS.md) has the
decisions.

## Soak report page

`/soak/<id>` shows one published soak report snapshot (plan 158). An admin publishes it from the backoffice, and the
page gives reviewers a public link to it with no sign-in.

In plain terms: the snapshot is frozen when it is published, so the page shows exactly the numbers the team saw. It
comes from the relayer's public `GET /v1/soak-reports/:id`, which returns `{ id, publishedAt, window, incidents,
report }`; `report` is the backoffice's soak report.

The page shows the window and publish date, the scorecard (Met, Not met, or Check by hand where the team checks a
criterion itself), the operators, the first 50 bridges with both unlock links, the disputes, performance (medians,
outcomes and volume are all time, and labelled so), and the team's incident notes as plain paragraphs. Explorer
links open in a new tab.

| Route | What it returns |
| --- | --- |
| `/soak/<id>` | The report page. An unknown or taken-down id is a 404. If the relayer fails, the page says the report is unavailable. |
| `/soak/<id>/bridges.csv` | Every bridge: trade id, settled time, and the unlock tx, URL and time per chain. |
| `/soak/<id>/disputes.csv` | Every dispute: case, trade, dates, filer, outcome, and its transaction links. |

The CSVs quote fields the same way as the backoffice's writer. They return 404 for an unknown id and 503 if the
relayer fails. The page and the CSVs are rebuilt at most every 5 minutes, which matches the relayer's cache.

## Configuration

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `STATS_API_URL_TESTNET` | no | `STATS_API_URL` | The testnet relayer base URL. |
| `STATS_API_URL` | no | `https://api-staging.pfbridge.xyz` | The testnet fallback, so today's deploys keep working. Never mainnet. |
| `STATS_API_URL_MAINNET` | no | `https://api.pfbridge.xyz` | The mainnet relayer base URL. |
| `APP_URL_TESTNET` | no | `https://staging.pfbridge.xyz` | The app link on the testnet page. |
| `APP_URL_MAINNET` | no | `https://app.pfbridge.xyz` | The app link on the mainnet page. |
| `MAINNET_LIVE` | no | unset | Only `true` turns on the mainnet stats. Anything else shows "coming soon". |

All of them are read on the server only, in `src/lib/config.ts`. There are no secrets and no `NEXT_PUBLIC_` variables.

## Develop

Node 24 or later and pnpm 10.

```bash
pnpm install
pnpm dev      # http://localhost:3100
pnpm test     # the lib rules and the soak CSV routes (node's built-in test runner)
pnpm build
pnpm start    # serves the build on :3100
```

## Deploy

```bash
docker build -t proofbridge-dashboard .
docker run -p 3100:3100 -e STATS_API_URL=https://api-staging.pfbridge.xyz proofbridge-dashboard
```

The page refreshes its data every 60 s. If the API can't be reached during the build, the first visits show "Stats
unavailable" until the next refresh.

## Layout

[`docs/STRUCTURE.md`](docs/STRUCTURE.md) has the full map and the rule for what goes where.

- `src/app/`: the routes only: the home page, `[network]` (`/testnet` and `/mainnet`), the soak report page and its
  two CSV routes, the root layout, the font files, and `globals.css`, which imports `src/styles/` in order.
- `src/components/`: the page parts: `layout/` (logo, top bar, network switch, footer), `ui/`, `charts/`, and each
  page's sections in `network/` and `soak/`.
- `src/lib/config.ts`: the two networks (relayer URL, app link, live) and their variables, the 8 s fetch timeout, and
  the 60 s and 300 s revalidate times.
- `src/lib/api/`: the server-side fetches and the CSV response.
- `src/lib/format/`: numbers, dates, chain names, explorer links and short ids, shared by both pages.
- `src/lib/network/` and `src/lib/soak/`: each endpoint's types, parsing and labels, plus the soak CSV writers.
- `tests/`: one spec per lib module under `tests/lib/`, the CSV routes under `tests/app/`, and the fixtures.
