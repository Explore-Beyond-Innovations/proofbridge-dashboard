// View rules over GET /v1/stats/network (plan 155 D5). Pure, so tests/view.spec.ts covers them.

export interface NetworkStats {
  range: string
  from: string | null
  to: string
  generatedAt: string
  trades: { reachedChain: number; completed: number; endedAfterLock: number; completionRate: number | null }
  volume: { tokenId: string; symbol: string; chainId: string; decimals: number; amount: string }[]
  settlement: { medianSeconds: number | null; buckets: { label: string; count: number }[] }
  proving: { medianProveMs: number | null }
  daily: { date: string; completed: number }[] // days with none left out
  disputes: {
    open: number
    MutualRefund: number
    TradeProceeds: number
    BridgerForfeit: number
    MakerForfeit: number
    Resolved: number
  }
}

export const DASH = "—"

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v)
const isNumOrNull = (v: unknown) => v === null || isNum(v)
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null

/** The response if it has the shape the tiles read, else null (the page then shows dashes). */
export function parseNetworkStats(body: unknown): NetworkStats | null {
  if (!isObj(body)) return null
  const { trades, volume, settlement, proving, daily, disputes } = body
  if (typeof body.to !== "string" || typeof body.generatedAt !== "string") return null
  if (!(body.from === null || typeof body.from === "string")) return null
  if (!isObj(trades) || !isNum(trades.completed) || !isNum(trades.reachedChain)) return null
  if (!isNumOrNull(trades.completionRate)) return null
  if (!isObj(proving) || !isNumOrNull(proving.medianProveMs)) return null
  if (!isObj(settlement) || !isNumOrNull(settlement.medianSeconds) || !Array.isArray(settlement.buckets)) return null
  if (!settlement.buckets.every((b) => isObj(b) && typeof b.label === "string" && isNum(b.count))) return null
  if (!Array.isArray(daily) || !daily.every((d) => isObj(d) && typeof d.date === "string" && isNum(d.completed)))
    return null
  const volumeOk = (v: unknown) =>
    isObj(v) && typeof v.symbol === "string" && typeof v.chainId === "string" && isNum(v.decimals) &&
    typeof v.amount === "string" && /^\d+$/.test(v.amount)
  if (!Array.isArray(volume) || !volume.every(volumeOk)) return null
  if (!isObj(disputes) || !DISPUTE_KEYS.every((k) => isNum(disputes[k]))) return null
  return body as unknown as NetworkStats
}

export const countText = (n: number | null | undefined) => (isNum(n) ? n.toLocaleString("en-US") : DASH)

/** completed ÷ (completed + endedAfterLock), as the relayer computes it; null before any trade has ended. */
export const completionText = (rate: number | null) => (rate === null ? "none ended yet" : `${(rate * 100).toFixed(1)}%`)

/** A proof time: milliseconds under a second, then seconds to one place. */
export function proveText(ms: number | null): string {
  if (ms === null) return DASH
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${(ms / 1000).toFixed(1)} s`
}

/** A duration in seconds: 45s, 1m49s, 2h05m. */
export function durationText(s: number | null): string {
  if (s === null) return DASH
  if (s < 60) return `${Math.round(s)}s`
  if (s < 3600) return `${Math.floor(s / 60)}m${String(Math.floor(s % 60)).padStart(2, "0")}s`
  return `${Math.floor(s / 3600)}h${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m`
}

const DISPUTE_KEYS = ["MutualRefund", "BridgerForfeit", "MakerForfeit", "TradeProceeds", "Resolved", "open"] as const

// Names match apps/frontend/lib/dispute.ts DISPUTE_OUTCOME_TEXT; Resolved is a dispute that ended with no ruling.
const DISPUTE_LABELS: Record<(typeof DISPUTE_KEYS)[number], string> = {
  MutualRefund: "Mutual refund",
  BridgerForfeit: "Bridger forfeit",
  MakerForfeit: "Maker forfeit",
  TradeProceeds: "Settled by proof",
  Resolved: "Ended with no ruling (refund)",
  open: "Still open",
}

export function disputeRows(d: NetworkStats["disputes"]): { label: string; count: number }[] {
  return DISPUTE_KEYS.map((k) => ({ label: DISPUTE_LABELS[k], count: d[k] }))
}

export const disputeTotal = (d: NetworkStats["disputes"]) => DISPUTE_KEYS.reduce((n, k) => n + d[k], 0)

/** A base-unit amount in whole tokens with thousands separators, cut (not rounded) to 2 places. */
export function tokenAmount(amount: string, decimals: number): string {
  if (!/^\d+$/.test(amount) || !Number.isInteger(decimals) || decimals < 0) return DASH
  const padded = amount.padStart(decimals + 1, "0")
  const whole = padded.slice(0, padded.length - decimals)
  const frac = padded.slice(padded.length - decimals).slice(0, 2).replace(/0+$/, "")
  const grouped = BigInt(whole).toLocaleString("en-US")
  return frac ? `${grouped}.${frac}` : grouped
}

const CHAIN_NAMES: Record<string, string> = {
  "11155111": "Sepolia",
  "1000002": "Stellar testnet",
  "1000001": "Stellar local",
}

export const chainName = (chainId: string) => CHAIN_NAMES[chainId] ?? `chain ${chainId}`

/** The daily series with the left-out days filled with zero, oldest first, from the range start to its end. */
export function fillDaily(daily: NetworkStats["daily"], from: string | null, to: string): { day: string; count: number }[] {
  if (daily.length === 0 && !from) return []
  const byDay = new Map(daily.map((d) => [d.date, d.completed]))
  const first = from ? from.slice(0, 10) : daily.reduce((m, d) => (d.date < m ? d.date : m), daily[0].date)
  const end = Date.parse(`${to.slice(0, 10)}T00:00:00Z`)
  const out: { day: string; count: number }[] = []
  for (let t = Date.parse(`${first}T00:00:00Z`); t <= end; t += 86_400_000) {
    const day = new Date(t).toISOString().slice(0, 10)
    out.push({ day, count: byDay.get(day) ?? 0 })
  }
  return out
}

/** "11 Nov 2026, 08:53 UTC" for the updated line. */
export function updatedText(iso: string): string {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return DASH
  const d = new Date(t)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const hh = String(d.getUTCHours()).padStart(2, "0")
  const mm = String(d.getUTCMinutes()).padStart(2, "0")
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${hh}:${mm} UTC`
}
