import { NetworkFooter } from "@/components/layout/Footer"
import { TopBar } from "@/components/layout/TopBar"
import { DailyBridges } from "@/components/network/DailyBridges"
import { DisputeOutcomes } from "@/components/network/DisputeOutcomes"
import { NetworkStatus } from "@/components/network/NetworkStatus"
import { StatTiles } from "@/components/network/StatTiles"
import { VolumePerToken } from "@/components/network/VolumePerToken"
import { Split } from "@/components/ui/Split"
import { getNetworkStats } from "@/lib/api/network-stats"

// D1: rebuilt on the server at most once a minute, matching the relayer's 60 s cache.
export const revalidate = 60 // NETWORK_REVALIDATE in lib/config.ts; Next needs a literal

export default async function Page() {
  const stats = await getNetworkStats()

  return (
    <main className="page">
      <TopBar title="ProofBridge Dashboard">
        <NetworkStatus stats={stats} />
      </TopBar>

      <p className="intro">
        Bridges, dispute outcomes and proof times on the ProofBridge testnet, over the last 30 days.
      </p>

      <StatTiles stats={stats} />

      <div className="body">
        <DailyBridges stats={stats} />
        <Split left={<DisputeOutcomes stats={stats} />} right={<VolumePerToken stats={stats} />} />
        <NetworkFooter />
      </div>
    </main>
  )
}
