# Code layout

In plain terms: routes stay thin, the page parts are components, the rules that turn relayer JSON into text live in
`src/lib`, and the tests mirror `src/lib`. Nothing the visitor sees changes: same routes, same HTML, same CSS, same
CSV bytes, same cache times and timeouts.

## Target layout

```
src/
  app/                      routes only: layout.tsx, page.tsx, globals.css, favicon.ico, fonts/,
                            soak/[id]/page.tsx, soak/[id]/{bridges,disputes}.csv/route.ts
  components/
    layout/                 Logo, TopBar (logo + title + status pill), Footer
    ui/                     Section, Metric, Table, ExternalLink, StatusPill, Split
    charts/                 SpeedBars, DailyBars, niceTicks
    network/                the home page's parts (status, stat tiles, daily, disputes, volume)
    soak/                   Report, Scorecard, Operators, Bridges, Disputes, Performance, Incidents, Unavailable
  lib/
    config.ts               the relayer base URL default, the fetch timeout and the revalidate times (one place)
    api/                    http.ts (fetch JSON with a timeout, to a result), network-stats.ts,
                            soak-snapshots.ts, csv-response.ts
    format/                 numbers, dates, chains (one chainName), explorer (links and address shapes), text
    network/                types.ts, parse.ts, view.ts (dispute rows, fillDaily)
    soak/                   types.ts, parse.ts, labels.ts, csv.ts
  styles/                   globals.css split into files, imported in the original order
tests/
  lib/{api,format,network,soak}/*.spec.ts   mirror src/lib
  app/soak/csv-routes.spec.ts               the two CSV route handlers
  fixtures/                                 network-stats.ts, soak-snapshot.ts
```

## What goes where

- `src/app`: a route file only reads params, fetches through `src/lib/api`, and hands the result to components. Next
  reads `revalidate` statically, so each route keeps its literal (60 or 300) with a note that `src/lib/config.ts` holds
  the same number for the fetch.
- `src/components`: React only, no fetching. `ui` and `charts` know nothing about the relayer's shapes beyond their
  props; `network` and `soak` are the sections of each page.
- `src/lib`: pure functions and types, plus the fetches in `api/`. `format/` is anything both pages print (numbers,
  dates, chain names, explorer links, short ids); `network/` and `soak/` are each endpoint's types, parsing and labels.
- `src/styles`: one file per area. The cascade is order-sensitive (the responsive blocks at the end override rules from
  every area, and `.stats--inset` must follow `.stats`), so the files are cut from `globals.css` in its own order, and
  `src/app/globals.css` imports them in that order. Some areas therefore have more than one file.
- `tests`: one spec per lib module, same path under `tests/lib`.

## Imports

Pages and components import with `@/…` (tsconfig `paths`, `@/*` → `./src/*`). Node's built-in test runner strips
types but does not read tsconfig `paths`, so everything a test loads (`src/lib/**` and the two CSV `route.ts` files)
keeps relative imports with the `.ts` extension, as it does today.

## Duplicates removed

- `chainName`: `lib/view.ts` and `lib/soak.ts` each had one; now one in `format/chains.ts` that takes an optional
  name the relayer already gave.
- The default relayer URL (in `lib/stats.ts` and `lib/soak-fetch.ts`) and the fetch timeout: now `lib/config.ts`.
- The fetch-with-timeout code of the two fetches: now `api/http.ts`.
- `updatedText` (home) and `timeText` (soak) printed the same "11 Nov 2026, 08:53 UTC": now one `timeText`.
- The dispute keys list (twice): now `network/types.ts`.

The two parsers keep their own small type guards: the soak one rejects arrays where the network one does not, and
merging them would change what each accepts.

## Move map

| Old | New |
| --- | --- |
| `app/layout.tsx`, `app/page.tsx`, `app/favicon.ico`, `app/fonts/` | `src/app/…` (same names) |
| `app/soak/[id]/page.tsx`, `app/soak/[id]/*.csv/route.ts` | `src/app/soak/[id]/…` |
| `app/globals.css` | `src/styles/*.css`; `src/app/globals.css` imports them |
| `app/components.tsx` `Logo` | `src/components/layout/Logo.tsx` |
| `app/components.tsx` `Section`, `Metric` | `src/components/ui/Section.tsx`, `Metric.tsx` |
| `app/components.tsx` `SpeedBars`, `DailyBars`, `niceTicks` | `src/components/charts/` |
| `app/page.tsx` top bar, tiles, sections, footer | `src/components/layout/TopBar.tsx`, `Footer.tsx`, `src/components/network/*` |
| `app/soak/[id]/page.tsx` `Ext`, `Table` | `src/components/ui/ExternalLink.tsx`, `Table.tsx` |
| `app/soak/[id]/page.tsx` `Report`, `Footer`, `Unavailable`, sections | `src/components/soak/*`, `src/components/layout/Footer.tsx` |
| `lib/stats.ts` | `src/lib/api/network-stats.ts` (+ `http.ts`, `config.ts`) |
| `lib/soak-fetch.ts` | `src/lib/api/soak-snapshots.ts`, `csv-response.ts` |
| `lib/view.ts` | `src/lib/network/{types,parse,view}.ts`, `src/lib/format/{numbers,dates,chains,text}.ts` |
| `lib/soak.ts` | `src/lib/soak/{types,parse,labels,csv}.ts`, `src/lib/format/{dates,explorer,text}.ts` |
| `tests/view.spec.ts` | `tests/lib/network/*.spec.ts`, `tests/lib/format/*.spec.ts` |
| `tests/soak.spec.ts` | `tests/lib/soak/*.spec.ts`, `tests/lib/format/*.spec.ts`, `tests/lib/api/`, `tests/app/soak/` |
| `tests/soak-fixture.ts`, the network sample in `tests/view.spec.ts` | `tests/fixtures/soak-snapshot.ts`, `network-stats.ts` |

`public/`, `next.config.ts` and `next-env.d.ts` stay at the root, where Next looks for them. The Dockerfile and CI run
`pnpm build` and `pnpm test` from the root, so they need no change.
