import { DailyBars } from "@/components/charts/DailyBars"
import { Section } from "@/components/ui/Section"
import { DASH } from "@/lib/format/text"
import type { NetworkStats } from "@/lib/network/types"
import { fillDaily } from "@/lib/network/view"

export function DailyBridges({ stats }: { stats: NetworkStats | null }) {
  return (
    <Section title="Daily bridges" subtitle="Completed per UTC day">
      {stats ? <DailyBars days={fillDaily(stats.daily, stats.from, stats.to)} /> : <div className="empty">{DASH}</div>}
    </Section>
  )
}
