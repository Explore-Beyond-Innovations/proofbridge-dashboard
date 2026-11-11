// Plan 155 D5: the dashboard's view rules. Run with `pnpm --filter @proofbridge/dashboard test`.
import { test } from "node:test"
import assert from "node:assert/strict"
import {
  DASH,
  chainName,
  completionText,
  countText,
  disputeRows,
  disputeTotal,
  durationText,
  fillDaily,
  parseNetworkStats,
  proveText,
  tokenAmount,
  updatedText,
} from "../lib/view.ts"

// Trimmed from a real staging response (2026-11-11).
const sample = () => ({
  range: "30d",
  from: "2026-10-12T08:53:08.184Z",
  to: "2026-11-11T08:53:08.184Z",
  generatedAt: "2026-11-11T08:53:08.184Z",
  trades: { reachedChain: 337, completed: 154, endedAfterLock: 105, completionRate: 0.5946 },
  volume: [{ tokenId: "t1", symbol: "PB", chainId: "1000002", decimals: 7, amount: "491010000000" }],
  settlement: { medianSeconds: 109, buckets: [{ label: "<1m", count: 27 }] },
  proving: { medianProveMs: 845 },
  daily: [{ date: "2026-11-09", completed: 23 }],
  disputes: { open: 0, MutualRefund: 1, TradeProceeds: 0, BridgerForfeit: 0, MakerForfeit: 0, Resolved: 6 },
})

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

test("counts are grouped, a missing count is a dash", () => {
  assert.equal(countText(154), "154")
  assert.equal(countText(12345), "12,345")
  assert.equal(countText(0), "0")
  assert.equal(countText(undefined), DASH)
})

test("completion rate is a percentage to one place; null means nothing has ended", () => {
  assert.equal(completionText(0.5946), "59.5%")
  assert.equal(completionText(1), "100.0%")
  assert.equal(completionText(0), "0.0%")
  assert.equal(completionText(null), "none ended yet")
})

test("proof time is ms under a second, seconds to one place above", () => {
  assert.equal(proveText(845), "845 ms")
  assert.equal(proveText(999.4), "999 ms")
  assert.equal(proveText(1000), "1.0 s")
  assert.equal(proveText(28400), "28.4 s")
  assert.equal(proveText(null), DASH)
})

test("durations read as s, m+s, h+m", () => {
  assert.equal(durationText(45), "45s")
  assert.equal(durationText(109), "1m49s")
  assert.equal(durationText(3599), "59m59s")
  assert.equal(durationText(3600), "1h00m")
  assert.equal(durationText(7505), "2h05m")
  assert.equal(durationText(null), DASH)
})

test("dispute rows keep every class, with the unruled end named as a refund", () => {
  const rows = disputeRows(sample().disputes)
  assert.deepEqual(rows, [
    { label: "Mutual refund", count: 1 },
    { label: "Bridger forfeit", count: 0 },
    { label: "Maker forfeit", count: 0 },
    { label: "Settled by proof", count: 0 },
    { label: "Ended with no ruling (refund)", count: 6 },
    { label: "Still open", count: 0 },
  ])
  assert.equal(disputeTotal({ open: 2, MutualRefund: 1, TradeProceeds: 3, BridgerForfeit: 4, MakerForfeit: 5, Resolved: 6 }), 21)
})

test("token amounts use the token's decimals, exactly, cut to two places", () => {
  assert.equal(tokenAmount("491010000000", 7), "49,101")
  assert.equal(tokenAmount("655957000000000000000000", 18), "655,957")
  assert.equal(tokenAmount("74000000000", 7), "7,400")
  assert.equal(tokenAmount("1259", 3), "1.25")
  assert.equal(tokenAmount("5", 2), "0.05")
  assert.equal(tokenAmount("0", 18), "0")
  assert.equal(tokenAmount("123456789012345678901234567890", 0), "123,456,789,012,345,678,901,234,567,890")
  assert.equal(tokenAmount("-1", 2), DASH)
})

test("known chains have names, others show their id", () => {
  assert.equal(chainName("11155111"), "Sepolia")
  assert.equal(chainName("1000002"), "Stellar testnet")
  assert.equal(chainName("42"), "chain 42")
})

test("daily bars cover every day of the range, zero where the relayer left a day out", () => {
  const days = fillDaily(
    [
      { date: "2026-11-09", completed: 23 },
      { date: "2026-11-07", completed: 24 },
    ],
    "2026-10-12T08:53:08.184Z",
    "2026-11-11T08:53:08.184Z",
  )
  assert.equal(days.length, 31)
  assert.deepEqual(days[0], { day: "2026-10-12", count: 0 })
  assert.deepEqual(days[days.length - 1], { day: "2026-11-11", count: 0 })
  assert.equal(days.find((d) => d.day === "2026-11-07")?.count, 24)
  assert.equal(days.find((d) => d.day === "2026-11-08")?.count, 0)
  assert.deepEqual(fillDaily([], null, "2026-11-11T00:00:00Z"), [])
})

test("the updated line is UTC", () => {
  assert.equal(updatedText("2026-11-11T08:53:08.184Z"), "11 Nov 2026, 08:53 UTC")
  assert.equal(updatedText("nope"), DASH)
})
