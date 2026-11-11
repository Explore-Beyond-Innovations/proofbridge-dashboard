// Plan 155 D5: the home page's dispute rows and daily series.
import { test } from "node:test"
import assert from "node:assert/strict"
import { disputeRows, disputeTotal, fillDaily } from "../../../src/lib/network/view.ts"
import { networkStatsBody as sample } from "../../fixtures/network-stats.ts"

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
