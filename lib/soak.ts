// Plan 158: view rules over GET /v1/soak-reports/:id (relayer soak-report.dto.ts). Pure, so tests/soak.spec.ts covers them.
import { DASH, DISPUTE_LABELS, chainName as knownChainName, type NetworkStats } from "./view.ts"

export interface SoakScorecardRow {
  criterion: string
  target: string
  result: string
  /** null: the team checks it by hand */
  met: boolean | null
}

export interface SoakOperator {
  identity: string
  chainId: string
  chainName: string | null
  locks: number
  firstLockAt: string
  firstLockTx: string
  firstLockUrl: string | null
  agentAccount: boolean
  hostedPod: boolean
}

export interface SoakBridgeLeg {
  chainId: string
  chainName: string | null
  txHash: string
  explorerUrl: string | null
  at: string
}

export interface SoakBridge {
  tradeId: string
  legs: SoakBridgeLeg[]
  settledAt: string
}

export interface SoakTx {
  kind: string
  chainId: string
  txHash: string
  explorerUrl: string | null
}

export interface SoakDispute {
  caseId: string
  tradeId: string
  status: string
  filerRole: string | null
  filer: string | null
  outcome: string | null
  ruled: boolean
  closed: boolean
  filedAt: string
  closedAt: string | null
  txs: SoakTx[]
}

export interface SoakReport {
  window: { from: string; to: string; days: number }
  definitions: { operator: string; bridge: string; disputeLifecycle: string }
  scorecard: SoakScorecardRow[]
  operators: SoakOperator[]
  bridges: SoakBridge[]
  disputes: SoakDispute[]
  performance: {
    allTime: {
      completed: number
      settlement: NetworkStats["settlement"]
      proving: NetworkStats["proving"]
      volume: NetworkStats["volume"]
      disputes: NetworkStats["disputes"]
    }
    daily: NetworkStats["daily"]
  }
  generatedAt: string
}

export interface SoakSnapshot {
  id: string
  publishedAt: string
  window: { from: string; to: string }
  incidents: string | null
  report: SoakReport
}

export const BRIDGE_ROWS = 50

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
const DISPUTE_KEYS = ["open", "MutualRefund", "TradeProceeds", "BridgerForfeit", "MakerForfeit", "Resolved"]

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

export type MetLabel = { text: "Met" | "Not met" | "Check by hand"; tone: "ok" | "warn" | "muted" }

/** `met: null` is a criterion the team checks by hand, never a pass. */
export function metLabel(met: boolean | null): MetLabel {
  if (met === null) return { text: "Check by hand", tone: "muted" }
  return met ? { text: "Met", tone: "ok" } : { text: "Not met", tone: "warn" }
}

const OUTCOMES = DISPUTE_LABELS as Record<string, string>
const outcomeText = (o: string) => OUTCOMES[o] ?? o

/** A closed case's outcome by name; "Resolved" is the fallback refund with no ruling. */
export function outcomeLabel(d: Pick<SoakDispute, "closed" | "ruled" | "status" | "outcome">): string {
  if (d.closed) return outcomeText(d.outcome ?? "Resolved")
  if (d.status === "pending" && d.outcome) return `Pending: ${outcomeText(d.outcome)}`
  return DISPUTE_LABELS.open
}

const ROLES: Record<string, string> = { maker: "Maker", bridger: "Bridger" }
export const roleText = (r: string | null) => (r ? (ROLES[r] ?? r) : "Unknown")

/** "dispute_filed" → "Dispute filed". */
export const kindText = (k: string) => (k ? k[0].toUpperCase() + k.slice(1).replace(/_/g, " ") : k)

export const chainName = (chainId: string, given?: string | null) => given || knownChainName(chainId)

export const short = (s: string) => (s.length > 13 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s)

/** An explorer URL only when it is plain https, so a bad row can't carry a javascript: link. */
export function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).protocol === "https:" ? url : null
  } catch {
    return null
  }
}

/** An address's explorer page where the chain and format allow it (as the backoffice's format.ts). */
export function addressUrl(addr: string, chainId: string): string | null {
  if (chainId === "11155111") return /^0x[0-9a-fA-F]{40}$/.test(addr) ? `https://sepolia.etherscan.io/address/${addr}` : null
  if (chainId === "1000002") {
    if (/^G[A-Z2-7]{55}$/.test(addr)) return `https://stellar.expert/explorer/testnet/account/${addr}`
    if (/^C[A-Z2-7]{55}$/.test(addr)) return `https://stellar.expert/explorer/testnet/contract/${addr}`
  }
  return null // 32-byte hex on Stellar: account or contract is unknown
}

/** A case's filer comes without a chain, so read it from the address shape. */
export function chainOfAddress(addr: string): string | null {
  if (/^0x[0-9a-fA-F]{40}$/.test(addr)) return "11155111"
  if (/^(0x)?[0-9a-fA-F]{64}$/.test(addr) || /^[GC][A-Z2-7]{55}$/.test(addr)) return "1000002"
  return null
}

const isEvm = (c: string) => c === "11155111"
const evmFirst = (a: string, b: string) => (isEvm(a) ? 0 : 1) - (isEvm(b) ? 0 : 1) || a.localeCompare(b)

/** The chains the bridges unlocked on, Sepolia first: one column (and one CSV group) each. */
export const legChains = (r: Pick<SoakReport, "bridges">) =>
  [...new Set(r.bridges.flatMap((b) => b.legs.map((l) => l.chainId)))].sort(evmFirst)

export function accountText(o: Pick<SoakOperator, "agentAccount" | "hostedPod">): string {
  return o.hostedPod ? "Hosted pod" : o.agentAccount ? "Agent account" : "Own key"
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const dayOf = (t: number) => {
  const d = new Date(t)
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** "26 Oct 2026" in UTC. */
export function dayText(iso: string): string {
  const t = Date.parse(iso)
  return Number.isNaN(t) ? DASH : dayOf(t)
}

/** "26 Oct 2026, 10:00 UTC". */
export function timeText(iso: string): string {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return DASH
  const d = new Date(t)
  return `${dayOf(t)}, ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`
}

const isMidnight = (t: number) => t % 86_400_000 === 0

/** The window with its exclusive end: whole days read as "26 Oct 2026 to 9 Nov 2026". */
export function windowText(from: string, to: string): string {
  const f = Date.parse(from)
  const t = Date.parse(to)
  if (Number.isNaN(f) || Number.isNaN(t)) return DASH
  if (isMidnight(f) && isMidnight(t)) return `${dayOf(f)} to ${dayOf(t - 1)}`
  return `${timeText(from)} to ${timeText(to)} (not included)`
}

/** The last instant inside an exclusive end, for the daily chart. */
export const lastInstant = (to: string) => new Date(Date.parse(to) - 1).toISOString()

/** Typed incident notes as plain paragraphs: split on blank lines, lines inside one kept. */
export function paragraphs(text: string | null | undefined): string[][] {
  if (!text) return []
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n[ \t]*\n/)
    .map((p) => p.split("\n").map((l) => l.trimEnd()).filter((l) => l.trim() !== ""))
    .filter((lines) => lines.length > 0)
}

export type CsvValue = string | number | boolean | null | undefined

/** RFC 4180, as plan 157's writer: a field is quoted when it holds a comma, quote or newline. */
export function csv(headers: string[], rows: CsvValue[][]): string {
  const f = (v: CsvValue) => {
    const s = v === null || v === undefined ? "" : String(v)
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [headers, ...rows].map((r) => r.map(f).join(",")).join("\n") + "\n"
}

export function bridgesCsv(r: SoakReport): string {
  const legs = legChains(r)
  return csv(
    ["trade_id", "settled_at", ...legs.flatMap((c) => [`unlock_tx_${c}`, `unlock_url_${c}`, `unlock_at_${c}`])],
    r.bridges.map((b) => [
      b.tradeId,
      b.settledAt,
      ...legs.flatMap((c) => {
        const l = b.legs.find((x) => x.chainId === c)
        return [l?.txHash, l?.explorerUrl, l?.at]
      }),
    ]),
  )
}

export function disputesCsv(r: SoakReport): string {
  return csv(
    ["case_id", "trade_id", "filed_at", "closed_at", "filer_role", "filer", "outcome", "ruled", "closed", "tx_links"],
    r.disputes.map((d) => [
      d.caseId,
      d.tradeId,
      d.filedAt,
      d.closedAt,
      d.filerRole,
      d.filer,
      d.outcome,
      d.ruled,
      d.closed,
      d.txs.map((t) => t.explorerUrl ?? t.txHash).join(" "),
    ]),
  )
}
