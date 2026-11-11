// UTC dates and times as both pages print them.
import { DASH } from "./text.ts"

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

/** "26 Oct 2026, 10:00 UTC" (also the home page's updated line). */
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
