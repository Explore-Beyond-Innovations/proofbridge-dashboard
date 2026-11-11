import { parseNetworkStats, type NetworkStats } from "./view"

// D2: the relayer base; staging runs the testnet soak.
const DEFAULT_STATS_API_URL = "https://api-staging.pfbridge.xyz"

/** D1 + D3: a server-side fetch, revalidated every 60 s; null on any failure so the page still renders. */
export async function getNetworkStats(): Promise<NetworkStats | null> {
  const base = (process.env.STATS_API_URL || DEFAULT_STATS_API_URL).replace(/\/+$/, "")
  try {
    const res = await fetch(`${base}/v1/stats/network?range=30d`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    return parseNetworkStats(await res.json())
  } catch {
    return null
  }
}
