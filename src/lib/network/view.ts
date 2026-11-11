// View rules over GET /v1/stats/network (plan 155 D5). Pure, so tests/lib/network/view.spec.ts covers them.
import { DISPUTE_KEYS, type NetworkStats } from "./types.ts"

// Names match apps/frontend/lib/dispute.ts DISPUTE_OUTCOME_TEXT; Resolved is a dispute that ended with no ruling.
export const DISPUTE_LABELS: Record<(typeof DISPUTE_KEYS)[number], string> = {
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
