// Plan 158: the snapshot's CSV writers.
import { test } from "node:test"
import assert from "node:assert/strict"
import { bridgesCsv, csv, disputesCsv } from "../../../src/lib/soak/csv.ts"
import { legChains } from "../../../src/lib/soak/labels.ts"
import { parseSnapshot } from "../../../src/lib/soak/parse.ts"
import { snapshotBody } from "../../fixtures/soak-snapshot.ts"

test("csv quotes a field holding a comma, quote or newline, as plan 157's writer", () => {
  assert.equal(csv(["a", "b"], [["x,y", 'say "hi"'], ["line\nbreak", null], [true, 3]]), 'a,b\n"x,y","say ""hi"""\n"line\nbreak",\ntrue,3\n')
})

test("bridges.csv: one column group per chain, Sepolia first, blanks for a missing leg", () => {
  const r = parseSnapshot(snapshotBody())!.report
  assert.deepEqual(legChains(r), ["11155111", "1000002"])
  const lines = bridgesCsv(r).trimEnd().split("\n")
  assert.equal(
    lines[0],
    "trade_id,settled_at,unlock_tx_11155111,unlock_url_11155111,unlock_at_11155111,unlock_tx_1000002,unlock_url_1000002,unlock_at_1000002",
  )
  assert.equal(
    lines[1],
    `t-1,2026-10-27T10:05:00.000Z,0x${"d".repeat(64)},,2026-10-27T10:00:00.000Z,${"c".repeat(64)},https://stellar.expert/explorer/testnet/tx/${"c".repeat(64)},2026-10-27T10:05:00.000Z`,
  )
  assert.equal(lines[2], `"odd,""id""",2026-10-28T10:00:00.000Z,0x${"e".repeat(64)},,2026-10-28T10:00:00.000Z,,,`)
})

test("disputes.csv: every dispute, tx links joined by spaces, a hash where there is no link", () => {
  const lines = disputesCsv(parseSnapshot(snapshotBody())!.report).trimEnd().split("\n")
  assert.equal(lines[0], "case_id,trade_id,filed_at,closed_at,filer_role,filer,outcome,ruled,closed,tx_links")
  assert.equal(
    lines[1],
    `case-1,t-1,2026-10-29T00:00:00.000Z,2026-10-30T00:00:00.000Z,bridger,0xd2306c80a26fe4b63ff89fd55f736b17cd425bf0,Resolved,false,true,https://sepolia.etherscan.io/tx/0xf ${"9".repeat(64)}`,
  )
  assert.equal(lines[2], "case-2,t-2,2026-11-01T00:00:00.000Z,,,,,false,false,")
  assert.equal(lines.length, 3)
})
