import { isSnapshotId, parseSnapshot, type SoakSnapshot } from "./soak.ts"

// Same base as the network stats (lib/stats.ts).
const DEFAULT_STATS_API_URL = "https://api-staging.pfbridge.xyz"

// Plan 158: snapshots are frozen, the relayer caches the read for 300 s, and so does this fetch.
export const SOAK_REVALIDATE = 300

export type SnapshotResult =
  | { kind: "ok"; snapshot: SoakSnapshot }
  | { kind: "missing" }
  | { kind: "unavailable" }

/** A 404 (or a malformed id) is missing; any other failure or an unreadable body is unavailable. */
export async function getSoakSnapshot(id: string): Promise<SnapshotResult> {
  if (!isSnapshotId(id)) return { kind: "missing" }
  const base = (process.env.STATS_API_URL || DEFAULT_STATS_API_URL).replace(/\/+$/, "")
  try {
    const res = await fetch(`${base}/v1/soak-reports/${encodeURIComponent(id)}`, {
      next: { revalidate: SOAK_REVALIDATE },
      signal: AbortSignal.timeout(8000),
    } as RequestInit)
    if (res.status === 404) return { kind: "missing" }
    if (!res.ok) return { kind: "unavailable" }
    const snapshot = parseSnapshot(await res.json())
    return snapshot ? { kind: "ok", snapshot } : { kind: "unavailable" }
  } catch {
    return { kind: "unavailable" }
  }
}

/** The CSV download response for a route handler: 404 for missing, 503 for unavailable. */
export async function csvResponse(id: string, name: "bridges" | "disputes", build: (s: SoakSnapshot) => string) {
  const r = await getSoakSnapshot(id)
  if (r.kind === "missing") return new Response("Not found\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } })
  if (r.kind === "unavailable")
    return new Response("Soak report unavailable right now. Try again in a minute.\n", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "60" },
    })
  return new Response(build(r.snapshot), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="soak-${r.snapshot.id}-${name}.csv"`,
      "Cache-Control": `public, max-age=${SOAK_REVALIDATE}`,
    },
  })
}
