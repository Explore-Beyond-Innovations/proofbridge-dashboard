// Plan 155 D5: parsing the network stats body.
import { test } from "node:test"
import assert from "node:assert/strict"
import { parseNetworkStats } from "../../../src/lib/network/parse.ts"
import { networkStatsBody as sample } from "../../fixtures/network-stats.ts"

test("parseNetworkStats accepts the live shape, including the nullable medians", () => {
  assert.ok(parseNetworkStats(sample()))
  const empty = { ...sample(), trades: { ...sample().trades, completionRate: null } }
  empty.proving = { medianProveMs: null } as never
  empty.settlement = { medianSeconds: null, buckets: [] } as never
  assert.ok(parseNetworkStats(empty))
})

test("parseNetworkStats rejects a body the tiles cannot read", () => {
  assert.equal(parseNetworkStats(null), null)
  assert.equal(parseNetworkStats("<html>502</html>"), null)
  assert.equal(parseNetworkStats({ message: "Not Found", statusCode: 404 }), null)
  const { disputes, ...noDisputes } = sample()
  void disputes
  assert.equal(parseNetworkStats(noDisputes), null)
  assert.equal(parseNetworkStats({ ...sample(), proving: { medianProveMs: "845" } }), null)
  const badAmount = sample()
  badAmount.volume[0].amount = "1.5"
  assert.equal(parseNetworkStats(badAmount), null)
})
