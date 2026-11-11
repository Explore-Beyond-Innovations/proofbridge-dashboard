import { StatusPill } from "@/components/ui/StatusPill"
import type { SnapshotResult } from "@/lib/api/soak-snapshots"
import { timeText } from "@/lib/format/dates"

export function SoakStatus({ result }: { result: Exclude<SnapshotResult, { kind: "missing" }> }) {
  return result.kind === "ok" ? (
    <StatusPill tone="ok" text="Published" time={timeText(result.snapshot.publishedAt)} />
  ) : (
    <StatusPill tone="warn" text="Report unavailable right now. Try again in a minute." />
  )
}
