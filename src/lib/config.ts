// The networks, timeout and cache times; route files repeat the revalidate literal because Next reads it statically.

export type NetworkId = "testnet" | "mainnet"

export type Network = { id: NetworkId; label: string; statsApiUrl: string; appUrl: string; live: boolean }

export const NETWORK_IDS: readonly NetworkId[] = ["testnet", "mainnet"]

// The defaults; getNetwork lays the environment over them. Staging runs the testnet soak.
export const NETWORKS: Record<NetworkId, Network> = {
  testnet: {
    id: "testnet",
    label: "Testnet",
    statsApiUrl: "https://api-staging.pfbridge.xyz",
    appUrl: "https://staging.pfbridge.xyz",
    live: true,
  },
  mainnet: {
    id: "mainnet",
    label: "Mainnet",
    statsApiUrl: "https://api.pfbridge.xyz",
    appUrl: "https://app.pfbridge.xyz",
    live: false,
  },
}

export const FETCH_TIMEOUT_MS = 8000

// D1: the network stats, matching the relayer's 60 s cache.
export const NETWORK_REVALIDATE = 60

// Plan 158: snapshots are frozen, the relayer caches the read for 300 s, and so does this fetch.
export const SOAK_REVALIDATE = 300

const trim = (url: string) => url.replace(/\/+$/, "")

/** A network with its environment applied (read on each call, on the server); null for an unknown id. */
export function getNetwork(id: string, env: NodeJS.ProcessEnv = process.env): Network | null {
  if (!Object.hasOwn(NETWORKS, id)) return null
  const d = NETWORKS[id as NetworkId]
  if (d.id === "testnet")
    return {
      ...d,
      statsApiUrl: trim(env.STATS_API_URL_TESTNET || env.STATS_API_URL || d.statsApiUrl),
      appUrl: trim(env.APP_URL_TESTNET || d.appUrl),
    }
  return {
    ...d,
    statsApiUrl: trim(env.STATS_API_URL_MAINNET || d.statsApiUrl),
    appUrl: trim(env.APP_URL_MAINNET || d.appUrl),
    live: env.MAINNET_LIVE === "true",
  }
}

/** D6: the soak pages always read the testnet relayer. */
export const apiBase = () => getNetwork("testnet")!.statsApiUrl
