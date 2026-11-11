// Plan 158: the snapshot's two CSV downloads.
import { legChains } from "./labels.ts"
import type { SoakReport } from "./types.ts"

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
