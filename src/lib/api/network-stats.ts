import { NETWORK_REVALIDATE } from "../config.ts"
import { parseNetworkStats } from "../network/parse.ts"
import type { NetworkStats } from "../network/types.ts"
import { getJson } from "./http.ts"

/** D1 + D3: a server-side fetch, revalidated every 60 s; null on any failure so the page still renders. */
export async function getNetworkStats(): Promise<NetworkStats | null> {
  const r = await getJson("/v1/stats/network?range=30d", NETWORK_REVALIDATE)
  return r.ok ? parseNetworkStats(r.body) : null
}
