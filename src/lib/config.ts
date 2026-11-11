// The relayer base, timeout and cache times; route files repeat the revalidate literal because Next reads it statically.

// D2: the relayer base; staging runs the testnet soak.
export const DEFAULT_STATS_API_URL = "https://api-staging.pfbridge.xyz"

export const FETCH_TIMEOUT_MS = 8000

// D1: the network stats, matching the relayer's 60 s cache.
export const NETWORK_REVALIDATE = 60

// Plan 158: snapshots are frozen, the relayer caches the read for 300 s, and so does this fetch.
export const SOAK_REVALIDATE = 300

/** STATS_API_URL (read on each call) without a trailing slash. */
export const apiBase = () => (process.env.STATS_API_URL || DEFAULT_STATS_API_URL).replace(/\/+$/, "")
