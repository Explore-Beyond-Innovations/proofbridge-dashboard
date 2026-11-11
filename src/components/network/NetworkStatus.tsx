import { StatusPill } from "@/components/ui/StatusPill"
import { timeText } from "@/lib/format/dates"
import type { NetworkStats } from "@/lib/network/types"

export function NetworkStatus({ stats }: { stats: NetworkStats | null }) {
  return stats ? (
    <StatusPill tone="ok" text="Updated" time={timeText(stats.generatedAt)} />
  ) : (
    <StatusPill tone="warn" text="Stats unavailable right now. Try again in a minute." />
  )
}
