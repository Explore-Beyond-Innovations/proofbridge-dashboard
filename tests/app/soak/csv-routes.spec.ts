// Plan 158: the two CSV route handlers.
import { test } from "node:test"
import assert from "node:assert/strict"
import { GET as bridgesGET } from "../../../src/app/soak/[id]/bridges.csv/route.ts"
import { GET as disputesGET } from "../../../src/app/soak/[id]/disputes.csv/route.ts"
import { bridgesCsv, disputesCsv } from "../../../src/lib/soak/csv.ts"
import { parseSnapshot } from "../../../src/lib/soak/parse.ts"
import { snapshotBody } from "../../fixtures/soak-snapshot.ts"
import { serve } from "../../fixtures/stub-fetch.ts"

const ctx = (id: string) => ({ params: Promise.resolve({ id }) })
const req = new Request("http://localhost/soak/x/bridges.csv")

test("CSV routes: the file as an attachment, 404 for an unknown id, 503 when the relayer fails", async () => {
  serve(200, snapshotBody())
  const ok = await bridgesGET(req, ctx("aB3dE5gH7j"))
  assert.equal(ok.status, 200)
  assert.equal(ok.headers.get("content-type"), "text/csv; charset=utf-8")
  assert.equal(ok.headers.get("content-disposition"), 'attachment; filename="soak-aB3dE5gH7j-bridges.csv"')
  assert.equal(await ok.text(), bridgesCsv(parseSnapshot(snapshotBody())!.report))

  const d = await disputesGET(req, ctx("aB3dE5gH7j"))
  assert.equal(d.headers.get("content-disposition"), 'attachment; filename="soak-aB3dE5gH7j-disputes.csv"')
  assert.equal(await d.text(), disputesCsv(parseSnapshot(snapshotBody())!.report))

  serve(404, { message: "Not Found" })
  assert.equal((await bridgesGET(req, ctx("aB3dE5gH7j"))).status, 404)
  serve(502, "bad gateway")
  const down = await disputesGET(req, ctx("aB3dE5gH7j"))
  assert.equal(down.status, 503)
  assert.match(await down.text(), /unavailable/)
})
