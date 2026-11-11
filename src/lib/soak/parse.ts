// Plan 158: parsing GET /v1/soak-reports/:id. Pure, so tests/lib/soak/parse.spec.ts covers it.
import { DISPUTE_KEYS } from "../network/types.ts"
import type { SoakReport, SoakSnapshot } from "./types.ts"

// A snapshot id as the relayer mints it (10-char base62); anything else is a 404 without a fetch.
export const isSnapshotId = (id: string) => /^[A-Za-z0-9]{1,64}$/.test(id)

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v)
const isStr = (v: unknown): v is string => typeof v === "string"
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v)
const isBool = (v: unknown): v is boolean => typeof v === "boolean"
const strOrNull = (v: unknown) => v === null || isStr(v)
const numOrNull = (v: unknown) => v === null || isNum(v)
const listOf = (v: unknown, ok: (x: Obj) => boolean) => Array.isArray(v) && v.every((x) => isObj(x) && ok(x))

const scoreOk = (s: Obj) => isStr(s.criterion) && isStr(s.target) && isStr(s.result) && (s.met === null || isBool(s.met))
const operatorOk = (o: Obj) =>
  isStr(o.identity) && isStr(o.chainId) && strOrNull(o.chainName) && isNum(o.locks) && isStr(o.firstLockAt) &&
  isStr(o.firstLockTx) && strOrNull(o.firstLockUrl) && isBool(o.agentAccount) && isBool(o.hostedPod)
const legOk = (l: Obj) => isStr(l.chainId) && strOrNull(l.chainName) && isStr(l.txHash) && strOrNull(l.explorerUrl) && isStr(l.at)
const bridgeOk = (b: Obj) => isStr(b.tradeId) && isStr(b.settledAt) && listOf(b.legs, legOk)
const txOk = (t: Obj) => isStr(t.kind) && isStr(t.chainId) && isStr(t.txHash) && strOrNull(t.explorerUrl)
const disputeOk = (d: Obj) =>
  isStr(d.caseId) && isStr(d.tradeId) && isStr(d.status) && strOrNull(d.filerRole) && strOrNull(d.filer) &&
  strOrNull(d.outcome) && isBool(d.ruled) && isBool(d.closed) && isStr(d.filedAt) && strOrNull(d.closedAt) &&
  listOf(d.txs, txOk)

function reportOk(r: unknown): r is SoakReport {
  if (!isObj(r) || !isStr(r.generatedAt)) return false
  const { window: w, definitions: d, performance: p } = r
  if (!isObj(w) || !isStr(w.from) || !isStr(w.to) || !isNum(w.days)) return false
  if (!isObj(d) || !isStr(d.operator) || !isStr(d.bridge) || !isStr(d.disputeLifecycle)) return false
  if (!listOf(r.scorecard, scoreOk) || !listOf(r.operators, operatorOk)) return false
  if (!listOf(r.bridges, bridgeOk) || !listOf(r.disputes, disputeOk)) return false
  if (!isObj(p) || !isObj(p.allTime) || !listOf(p.daily, (x) => isStr(x.date) && isNum(x.completed))) return false
  const a = p.allTime
  if (!isNum(a.completed) || !isObj(a.proving) || !numOrNull(a.proving.medianProveMs)) return false
  if (!isObj(a.settlement) || !numOrNull(a.settlement.medianSeconds)) return false
  if (!listOf(a.settlement.buckets, (b) => isStr(b.label) && isNum(b.count))) return false
  const volOk = (v: Obj) => isStr(v.symbol) && isStr(v.chainId) && isNum(v.decimals) && isStr(v.amount) && /^\d+$/.test(v.amount)
  if (!listOf(a.volume, volOk)) return false
  return isObj(a.disputes) && DISPUTE_KEYS.every((k) => isNum((a.disputes as Obj)[k]))
}

/** The public snapshot if every field the page reads has its DTO type, else null (the page says unavailable). */
export function parseSnapshot(body: unknown): SoakSnapshot | null {
  if (!isObj(body) || !isStr(body.id) || !isStr(body.publishedAt)) return null
  if (!isObj(body.window) || !isStr(body.window.from) || !isStr(body.window.to)) return null
  if (!(body.incidents === undefined || strOrNull(body.incidents))) return null
  if (!reportOk(body.report)) return null
  return { ...(body as unknown as SoakSnapshot), incidents: (body.incidents as string | null | undefined) ?? null }
}
