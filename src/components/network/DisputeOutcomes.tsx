import { Section } from "@/components/ui/Section"
import { countText } from "@/lib/format/numbers"
import type { NetworkStats } from "@/lib/network/types"
import { disputeTotal } from "@/lib/network/view"
import { DisputeList } from "./DisputeList"

export function DisputeOutcomes({ stats }: { stats: NetworkStats | null }) {
  return (
    <Section title="Dispute outcomes" subtitle={stats ? `${countText(disputeTotal(stats.disputes))} disputes` : "By outcome"}>
      <DisputeList disputes={stats ? stats.disputes : null} />
    </Section>
  )
}
