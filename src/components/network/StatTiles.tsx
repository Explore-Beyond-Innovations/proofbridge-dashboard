import { SpeedBars } from "@/components/charts/SpeedBars"
import { Metric } from "@/components/ui/Metric"
import { completionText, countText, durationText, proveText } from "@/lib/format/numbers"
import { DASH } from "@/lib/format/text"
import type { NetworkStats } from "@/lib/network/types"

// Bridges completed, proof generation and settlement time, with dashes when the stats are down.
export function StatTiles({ stats }: { stats: NetworkStats | null }) {
  return (
    <div className="stats">
      <Metric
        label="Bridges completed"
        value={countText(stats?.trades.completed)}
        hint={
          stats
            ? `Completion rate ${completionText(stats.trades.completionRate)}, of trades that ended after the maker locked`
            : "Settled cross-chain trades, last 30 days"
        }
      />
      <Metric
        label="Proof generation"
        value={stats ? proveText(stats.proving.medianProveMs) : DASH}
        hint="Median (p50) time to generate a settlement proof"
      />
      <Metric
        label="Settlement time"
        value={stats ? durationText(stats.settlement.medianSeconds) : DASH}
        hint="Median (p50) from the maker's lock to the last leg confirmed"
      >
        {stats && stats.settlement.buckets.length > 0 && <SpeedBars buckets={stats.settlement.buckets} />}
      </Metric>
    </div>
  )
}
