import { DASH } from "./text.ts"

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v)

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

/** A base-unit amount in whole tokens with thousands separators, cut (not rounded) to 2 places. */
export function tokenAmount(amount: string, decimals: number): string {
  if (!/^\d+$/.test(amount) || !Number.isInteger(decimals) || decimals < 0) return DASH
  const padded = amount.padStart(decimals + 1, "0")
  const whole = padded.slice(0, padded.length - decimals)
  const frac = padded.slice(padded.length - decimals).slice(0, 2).replace(/0+$/, "")
  const grouped = BigInt(whole).toLocaleString("en-US")
  return frac ? `${grouped}.${frac}` : grouped
}
