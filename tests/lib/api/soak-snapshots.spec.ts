// Plan 158: the snapshot fetch.
import { test } from "node:test"
import assert from "node:assert/strict"
import { getSoakSnapshot } from "../../../src/lib/api/soak-snapshots.ts"
import { snapshotBody } from "../../fixtures/soak-snapshot.ts"
import { serve } from "../../fixtures/stub-fetch.ts"

test("the snapshot fetch: 404 is missing, other failures are unavailable, a bad id never fetches", async () => {
  const urls = serve(200, snapshotBody())
  process.env.STATS_API_URL = "http://relayer.test/"
  assert.equal((await getSoakSnapshot("aB3dE5gH7j")).kind, "ok")
  assert.deepEqual(urls, ["http://relayer.test/v1/soak-reports/aB3dE5gH7j"])
  serve(404, { message: "Not Found" })
  assert.equal((await getSoakSnapshot("aB3dE5gH7j")).kind, "missing")
  serve(500, "boom")
  assert.equal((await getSoakSnapshot("aB3dE5gH7j")).kind, "unavailable")
  serve(200, "<html>")
  assert.equal((await getSoakSnapshot("aB3dE5gH7j")).kind, "unavailable")
  serve(200, { id: "aB3dE5gH7j", report: {} })
  assert.equal((await getSoakSnapshot("aB3dE5gH7j")).kind, "unavailable")
  globalThis.fetch = (async () => {
    throw new Error("ECONNREFUSED")
  }) as typeof fetch
  assert.equal((await getSoakSnapshot("aB3dE5gH7j")).kind, "unavailable")
  const none = serve(200, snapshotBody())
  assert.equal((await getSoakSnapshot("../admin")).kind, "missing")
  assert.deepEqual(none, [])
})
