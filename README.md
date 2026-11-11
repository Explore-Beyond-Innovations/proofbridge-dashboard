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

## Configuration

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `STATS_API_URL` | no | `https://api-staging.pfbridge.xyz` | The relayer base URL. Read on the server only. |

Nothing else is needed: there are no secrets and no `NEXT_PUBLIC_` variables.

## Develop

Node 24 or later and pnpm 10.

```bash
pnpm install
pnpm dev      # http://localhost:3100
pnpm test     # the view rules (node's built-in test runner)
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

- `app/`: the page, its layout and styles, plus the Google Sans Flex font files.
- `lib/stats.ts`: the server-side fetch, with an 8 s timeout and a 60 s revalidate.
- `lib/view.ts`: the pure view rules: parsing, number formats and outcome labels. They are covered by
  `tests/view.spec.ts`.
