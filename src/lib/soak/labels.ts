// Plan 158: the soak page's labels. Pure, so tests/lib/soak/labels.spec.ts covers them.
import { DISPUTE_LABELS } from "../network/view.ts"
import type { SoakDispute, SoakOperator, SoakReport } from "./types.ts"

export const BRIDGE_ROWS = 50

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

export function accountText(o: Pick<SoakOperator, "agentAccount" | "hostedPod">): string {
  return o.hostedPod ? "Hosted pod" : o.agentAccount ? "Agent account" : "Own key"
}

const isEvm = (c: string) => c === "11155111"
const evmFirst = (a: string, b: string) => (isEvm(a) ? 0 : 1) - (isEvm(b) ? 0 : 1) || a.localeCompare(b)

/** The chains the bridges unlocked on, Sepolia first: one column (and one CSV group) each. */
export const legChains = (r: Pick<SoakReport, "bridges">) =>
  [...new Set(r.bridges.flatMap((b) => b.legs.map((l) => l.chainId)))].sort(evmFirst)
