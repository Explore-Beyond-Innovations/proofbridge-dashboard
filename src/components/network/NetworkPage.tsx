import { NetworkFooter } from "@/components/layout/Footer"
import { TopBar } from "@/components/layout/TopBar"
import { Split } from "@/components/ui/Split"
import type { Network } from "@/lib/config"
import type { NetworkStats } from "@/lib/network/types"
import { ComingSoon } from "./ComingSoon"
import { DailyBridges } from "./DailyBridges"
import { DisputeOutcomes } from "./DisputeOutcomes"
import { NetworkStatus } from "./NetworkStatus"
import { StatTiles } from "./StatTiles"
import { VolumePerToken } from "./VolumePerToken"

// D3: the one network page; a network that isn't live shows ComingSoon instead of the stats.
export function NetworkPage({ network, stats }: { network: Network; stats: NetworkStats | null }) {
  if (!network.live)
    return (
      <main className="page">
        <TopBar title="ProofBridge Dashboard" network={network.id} />
        <ComingSoon />
      </main>
    )

  return (
    <main className="page">
      <TopBar title="ProofBridge Dashboard" network={network.id}>
        <NetworkStatus stats={stats} />
      </TopBar>

      <p className="intro">
        Bridges, dispute outcomes and proof times on the ProofBridge {network.id}, over the last 30 days.
      </p>

      <StatTiles stats={stats} />

      <div className="body">
        <DailyBridges stats={stats} />
        <Split left={<DisputeOutcomes stats={stats} />} right={<VolumePerToken stats={stats} />} />
        <NetworkFooter appUrl={network.appUrl} />
      </div>
    </main>
  )
}
