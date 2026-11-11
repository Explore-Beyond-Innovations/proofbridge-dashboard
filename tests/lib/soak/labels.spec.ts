// Plan 158: the soak page's labels.
import { test } from "node:test"
import assert from "node:assert/strict"
import { BRIDGE_ROWS, accountText, metLabel, outcomeLabel } from "../../../src/lib/soak/labels.ts"

test("scorecard: met is Met, false is Not met, null is check by hand (never a pass)", () => {
  assert.deepEqual(metLabel(true), { text: "Met", tone: "ok" })
  assert.deepEqual(metLabel(false), { text: "Not met", tone: "warn" })
  assert.deepEqual(metLabel(null), { text: "Check by hand", tone: "muted" })
})

test("outcomes: Resolved is the refund with no ruling; rulings by name; unclosed cases open or pending", () => {
  const closed = { closed: true, status: "closed" }
  assert.equal(outcomeLabel({ ...closed, ruled: false, outcome: "Resolved" }), "Ended with no ruling (refund)")
  assert.equal(outcomeLabel({ ...closed, ruled: true, outcome: "MutualRefund" }), "Mutual refund")
  assert.equal(outcomeLabel({ ...closed, ruled: true, outcome: "TradeProceeds" }), "Settled by proof")
  assert.equal(outcomeLabel({ closed: false, ruled: false, status: "pending", outcome: "MakerForfeit" }), "Pending: Maker forfeit")
  assert.equal(outcomeLabel({ closed: false, ruled: false, status: "open", outcome: null }), "Still open")
  assert.equal(outcomeLabel({ closed: false, ruled: true, status: "open", outcome: "MutualRefund" }), "Still open")
  assert.equal(outcomeLabel({ ...closed, ruled: false, outcome: null }), "Ended with no ruling (refund)")
})

test("account kind and the bridge row cap", () => {
  assert.equal(accountText({ agentAccount: true, hostedPod: true }), "Hosted pod")
  assert.equal(accountText({ agentAccount: true, hostedPod: false }), "Agent account")
  assert.equal(accountText({ agentAccount: false, hostedPod: false }), "Own key")
  assert.equal(BRIDGE_ROWS, 50)
})
