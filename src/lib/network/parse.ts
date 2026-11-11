import { DISPUTE_KEYS, type NetworkStats } from "./types.ts"

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
