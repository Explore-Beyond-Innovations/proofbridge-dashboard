// Plan 158: the soak page's view rules and its CSV routes.
import { afterEach, test } from "node:test"
import assert from "node:assert/strict"
import {
  BRIDGE_ROWS,
  accountText,
  addressUrl,
  bridgesCsv,
  csv,
  disputesCsv,
  kindText,
  legChains,
  metLabel,
  outcomeLabel,
  paragraphs,
  parseSnapshot,
  safeUrl,
  short,
  windowText,
} from "../lib/soak.ts"
import { getSoakSnapshot } from "../lib/soak-fetch.ts"
import { GET as bridgesGET } from "../app/soak/[id]/bridges.csv/route.ts"
import { GET as disputesGET } from "../app/soak/[id]/disputes.csv/route.ts"
import { snapshotBody } from "./soak-fixture.ts"

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

// Serves one response for every fetch and records the URLs asked for.
function serve(status: number, body: unknown): string[] {
  const urls: string[] = []
  globalThis.fetch = (async (url: string | URL) => {
    urls.push(String(url))
    return new Response(typeof body === "string" ? body : JSON.stringify(body), { status })
  }) as typeof fetch
  return urls
}

const ctx = (id: string) => ({ params: Promise.resolve({ id }) })
const req = new Request("http://localhost/soak/x/bridges.csv")

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

test("incidents split into plain paragraphs on blank lines, text left as typed", () => {
  assert.deepEqual(paragraphs("One\nline two\n\n  \n\r\nThree <b>x</b>  \n"), [["One", "line two"], ["Three <b>x</b>"]])
  assert.deepEqual(paragraphs(null), [])
  assert.deepEqual(paragraphs("\n\n"), [])
})

test("explorer links must be https; addresses link only in a known shape", () => {
  assert.equal(safeUrl("https://sepolia.etherscan.io/tx/0x1"), "https://sepolia.etherscan.io/tx/0x1")
  assert.equal(safeUrl("javascript:alert(1)"), null)
  assert.equal(safeUrl("http://example.com"), null)
  assert.equal(safeUrl(null), null)
  assert.equal(
    addressUrl("0xd2306c80a26fe4b63ff89fd55f736b17cd425bf0", "11155111"),
    "https://sepolia.etherscan.io/address/0xd2306c80a26fe4b63ff89fd55f736b17cd425bf0",
  )
  assert.equal(addressUrl("ab".repeat(32), "1000002"), null)
  assert.equal(addressUrl(`G${"A".repeat(55)}`, "1000002"), `https://stellar.expert/explorer/testnet/account/G${"A".repeat(55)}`)
})

test("small labels: short ids, tx kinds, account kind, window with an exclusive end", () => {
  assert.equal(short("0xd2306c80a26fe4b63ff89fd55f736b17cd425bf0"), "0xd230…5bf0")
  assert.equal(short("case-1"), "case-1")
  assert.equal(kindText("dispute_filed"), "Dispute filed")
  assert.equal(accountText({ agentAccount: true, hostedPod: true }), "Hosted pod")
  assert.equal(accountText({ agentAccount: true, hostedPod: false }), "Agent account")
  assert.equal(accountText({ agentAccount: false, hostedPod: false }), "Own key")
  assert.equal(windowText("2026-10-26T00:00:00.000Z", "2026-11-10T00:00:00.000Z"), "26 Oct 2026 to 9 Nov 2026")
  assert.equal(
    windowText("2026-10-26T09:30:00Z", "2026-11-10T00:00:00Z"),
    "26 Oct 2026, 09:30 UTC to 10 Nov 2026, 00:00 UTC (not included)",
  )
  assert.equal(BRIDGE_ROWS, 50)
})

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
