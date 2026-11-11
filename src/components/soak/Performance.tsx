import { SpeedBars } from "@/components/charts/SpeedBars"
import { Metric } from "@/components/ui/Metric"
import { Section } from "@/components/ui/Section"
import { chainName } from "@/lib/format/chains"
import { countText, durationText, proveText, tokenAmount } from "@/lib/format/numbers"
import type { SoakReport } from "@/lib/soak/types"

type AllTime = SoakReport["performance"]["allTime"]

// All-time medians from the network stats, labelled so.
export function Performance({ all }: { all: AllTime }) {
  return (
    <Section title="Performance" subtitle="Medians, outcomes and volume are all time, from the network stats">
      <div className="stats stats--inset">
        <Metric label="Bridges completed (all time)" value={countText(all.completed)} hint="Settled cross-chain trades" />
        <Metric
          label="Proof generation (all time)"
          value={proveText(all.proving.medianProveMs)}
          hint="Median (p50) time to generate a settlement proof"
        />
        <Metric
          label="Settlement time (all time)"
          value={durationText(all.settlement.medianSeconds)}
          hint="Median (p50) from the maker's lock to the last leg confirmed"
        >
          {all.settlement.buckets.length > 0 && <SpeedBars buckets={all.settlement.buckets} />}
        </Metric>
      </div>
    </Section>
  )
}

export function AllTimeVolume({ volume }: { volume: AllTime["volume"] }) {
  return (
    <Section title="Volume per token (all time)" subtitle="Settled, in each token's own units">
      <ul className="rows">
        {volume.length === 0 && (
          <li>
            <span>No settled volume yet</span>
          </li>
        )}
        {volume.map((v) => (
          <li key={`${v.chainId}:${v.tokenId}`}>
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
