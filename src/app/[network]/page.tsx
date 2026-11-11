import { notFound } from "next/navigation"
import { NetworkPage } from "@/components/network/NetworkPage"
import { getNetworkStats } from "@/lib/api/network-stats"
import { NETWORK_IDS, getNetwork } from "@/lib/config"

// D1: rebuilt on the server at most once a minute, matching the relayer's 60 s cache.
export const revalidate = 60 // NETWORK_REVALIDATE in lib/config.ts; Next needs a literal

// D3: only /testnet and /mainnet; anything else is a 404 (the static soak/ segment still wins).
export const dynamicParams = false
export const generateStaticParams = () => NETWORK_IDS.map((network) => ({ network }))

export default async function Page({ params }: { params: Promise<{ network: string }> }) {
  const network = getNetwork((await params).network)
  if (!network) notFound()
  return <NetworkPage network={network} stats={await getNetworkStats(network)} />
}
