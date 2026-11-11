import { NETWORK_REVALIDATE, type Network } from "../config.ts"
import { parseNetworkStats } from "../network/parse.ts"
import type { NetworkStats } from "../network/types.ts"
import { getJson } from "./http.ts"

/** D1 + D3: a server-side fetch, revalidated every 60 s; null on any failure so the page still renders. */
export async function getNetworkStats(network: Network): Promise<NetworkStats | null> {
  // D4: a network that isn't live never calls an API.
  if (!network.live) return null
  const r = await getJson("/v1/stats/network?range=30d", NETWORK_REVALIDATE, network.statsApiUrl)
  return r.ok ? parseNetworkStats(r.body) : null
}
