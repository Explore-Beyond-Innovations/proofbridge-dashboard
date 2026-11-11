// D1 + D4: the network stats fetch.
import { test } from "node:test"
import assert from "node:assert/strict"
import { getNetworkStats } from "../../../src/lib/api/network-stats.ts"
import { getNetwork } from "../../../src/lib/config.ts"
import { networkStatsBody } from "../../fixtures/network-stats.ts"
import { serve } from "../../fixtures/stub-fetch.ts"

test("getNetworkStats: reads the network's own relayer; a network that isn't live never fetches", async () => {
  const urls = serve(200, networkStatsBody())
  const env = { STATS_API_URL: "http://t.test", STATS_API_URL_MAINNET: "http://m.test" }
  assert.equal((await getNetworkStats(getNetwork("testnet", env)!))?.trades.completed, 154)
  assert.equal(await getNetworkStats(getNetwork("mainnet", env)!), null)
  assert.ok(await getNetworkStats(getNetwork("mainnet", { ...env, MAINNET_LIVE: "true" })!))
  assert.deepEqual(urls, ["http://t.test/v1/stats/network?range=30d", "http://m.test/v1/stats/network?range=30d"])
})
