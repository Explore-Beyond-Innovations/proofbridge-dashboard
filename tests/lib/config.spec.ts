// The two networks and the environment over them.
import { test } from "node:test"
import assert from "node:assert/strict"
import { getNetwork } from "../../src/lib/config.ts"

test("getNetwork: the defaults with no environment", () => {
  assert.deepEqual(getNetwork("testnet", {}), {
    id: "testnet",
    label: "Testnet",
    statsApiUrl: "https://api-staging.pfbridge.xyz",
    appUrl: "https://staging.pfbridge.xyz",
    live: true,
  })
  assert.deepEqual(getNetwork("mainnet", {}), {
    id: "mainnet",
    label: "Mainnet",
    statsApiUrl: "https://api.pfbridge.xyz",
    appUrl: "https://app.pfbridge.xyz",
    live: false,
  })
})

test("getNetwork: the testnet URL is STATS_API_URL_TESTNET, then STATS_API_URL, then the default", () => {
  const both = { STATS_API_URL_TESTNET: "http://t.test/", STATS_API_URL: "http://old.test" }
  assert.equal(getNetwork("testnet", both)!.statsApiUrl, "http://t.test")
  assert.equal(getNetwork("testnet", { STATS_API_URL: "http://old.test//" })!.statsApiUrl, "http://old.test")
  assert.equal(getNetwork("testnet", { STATS_API_URL_TESTNET: "", STATS_API_URL: "" })!.statsApiUrl, "https://api-staging.pfbridge.xyz")
  // STATS_API_URL never reaches mainnet.
  assert.equal(getNetwork("mainnet", both)!.statsApiUrl, "https://api.pfbridge.xyz")
})

test("getNetwork: the mainnet URL and both app links come from their own variables", () => {
  const env = { STATS_API_URL_MAINNET: "http://m.test/", APP_URL_TESTNET: "http://ta.test", APP_URL_MAINNET: "http://ma.test/" }
  assert.equal(getNetwork("mainnet", env)!.statsApiUrl, "http://m.test")
  assert.equal(getNetwork("mainnet", env)!.appUrl, "http://ma.test")
  assert.equal(getNetwork("testnet", env)!.appUrl, "http://ta.test")
})

test("getNetwork: only MAINNET_LIVE=true turns mainnet on; testnet is always live", () => {
  assert.equal(getNetwork("mainnet", { MAINNET_LIVE: "true" })!.live, true)
  for (const v of ["", "1", "TRUE", "yes", " true", "false"])
    assert.equal(getNetwork("mainnet", { MAINNET_LIVE: v })!.live, false, `MAINNET_LIVE=${JSON.stringify(v)}`)
  assert.equal(getNetwork("testnet", { MAINNET_LIVE: "false" })!.live, true)
})

test("getNetwork: an unknown id is null", () => {
  for (const id of ["foo", "", "Testnet", "soak", "toString", "__proto__"]) assert.equal(getNetwork(id, {}), null, id)
})
