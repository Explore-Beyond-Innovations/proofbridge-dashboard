// Plan 158: parsing the soak snapshot body.
import { test } from "node:test"
import assert from "node:assert/strict"
import { parseSnapshot } from "../../../src/lib/soak/parse.ts"
import { snapshotBody } from "../../fixtures/soak-snapshot.ts"

test("parseSnapshot accepts the DTO shape and a missing incidents field", () => {
  const s = parseSnapshot(snapshotBody())
  assert.ok(s)
  assert.equal(s.report.bridges.length, 2)
  const { incidents, ...noIncidents } = snapshotBody()
  void incidents
  assert.equal(parseSnapshot(noIncidents)?.incidents, null)
})

test("parseSnapshot rejects a body the page cannot read", () => {
  assert.equal(parseSnapshot(null), null)
  assert.equal(parseSnapshot({ message: "Not Found", statusCode: 404 }), null)
  const noReport = { ...snapshotBody(), report: undefined }
  assert.equal(parseSnapshot(noReport), null)
  const badMet = snapshotBody()
  ;(badMet.report.scorecard[0] as { met: unknown }).met = "yes"
  assert.equal(parseSnapshot(badMet), null)
  const badLeg = snapshotBody()
  ;(badLeg.report.bridges[0].legs[0] as { txHash: unknown }).txHash = 7
  assert.equal(parseSnapshot(badLeg), null)
  const badDisputes = snapshotBody()
  delete (badDisputes.report.performance.allTime.disputes as Partial<Record<string, number>>).Resolved
  assert.equal(parseSnapshot(badDisputes), null)
  const badVolume = snapshotBody()
  badVolume.report.performance.allTime.volume[0].amount = "1.5"
  assert.equal(parseSnapshot(badVolume), null)
})
