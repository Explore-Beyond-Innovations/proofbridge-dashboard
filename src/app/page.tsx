import { NetworkPage } from "@/components/network/NetworkPage"
import { getNetworkStats } from "@/lib/api/network-stats"
import { getNetwork } from "@/lib/config"

// D1: rebuilt on the server at most once a minute, matching the relayer's 60 s cache.
export const revalidate = 60 // NETWORK_REVALIDATE in lib/config.ts; Next needs a literal

// D7: the home page is testnet.
export default async function Page() {
  const network = getNetwork("testnet")!
  return <NetworkPage network={network} stats={await getNetworkStats(network)} />
}
