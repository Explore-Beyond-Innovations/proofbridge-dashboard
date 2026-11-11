import { Section } from "@/components/ui/Section"
import { chainName } from "@/lib/format/chains"
import { tokenAmount } from "@/lib/format/numbers"
import { DASH } from "@/lib/format/text"
import type { NetworkStats } from "@/lib/network/types"

export function VolumePerToken({ stats }: { stats: NetworkStats | null }) {
  return (
    <Section title="Volume per token" subtitle="Settled, in each token's own units">
      <ul className="rows">
        {!stats && (
          <li>
            <span>{DASH}</span>
          </li>
        )}
        {stats && stats.volume.length === 0 && (
          <li>
            <span>No settled volume yet</span>
          </li>
        )}
        {stats?.volume.map((v) => (
          <li key={v.tokenId}>
            <span>
              {v.symbol} <span className="rows__sub">{chainName(v.chainId)}</span>
            </span>
            <span>{tokenAmount(v.amount, v.decimals)}</span>
          </li>
        ))}
      </ul>
    </Section>
  )
}
