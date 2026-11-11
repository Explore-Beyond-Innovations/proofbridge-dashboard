import { SOAK_REVALIDATE } from "../config.ts"
import { isSnapshotId, parseSnapshot } from "../soak/parse.ts"
import type { SoakSnapshot } from "../soak/types.ts"
import { getJson } from "./http.ts"

export type SnapshotResult =
  | { kind: "ok"; snapshot: SoakSnapshot }
  | { kind: "missing" }
  | { kind: "unavailable" }

/** A 404 (or a malformed id) is missing; any other failure or an unreadable body is unavailable. */
export async function getSoakSnapshot(id: string): Promise<SnapshotResult> {
  if (!isSnapshotId(id)) return { kind: "missing" }
  const r = await getJson(`/v1/soak-reports/${encodeURIComponent(id)}`, SOAK_REVALIDATE)
  if (!r.ok) return r.status === 404 ? { kind: "missing" } : { kind: "unavailable" }
  const snapshot = parseSnapshot(r.body)
  return snapshot ? { kind: "ok", snapshot } : { kind: "unavailable" }
}
