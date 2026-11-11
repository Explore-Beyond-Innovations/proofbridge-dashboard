import { ExternalLink } from "@/components/ui/ExternalLink"
import { Section } from "@/components/ui/Section"
import { Table } from "@/components/ui/Table"
import { chainName } from "@/lib/format/chains"
import { timeText } from "@/lib/format/dates"
import { countText } from "@/lib/format/numbers"
import { DASH, short } from "@/lib/format/text"
import { BRIDGE_ROWS, legChains } from "@/lib/soak/labels"
import type { SoakReport } from "@/lib/soak/types"

// The first BRIDGE_ROWS bridges with an unlock column per chain; the CSV has them all.
export function Bridges({ r, base }: { r: SoakReport; base: string }) {
  const legs = legChains(r)
  const shown = r.bridges.slice(0, BRIDGE_ROWS)
  return (
    <Section
      title="Bridges"
      subtitle={
        r.bridges.length > shown.length
          ? `${countText(r.bridges.length)} bridges; the first ${countText(shown.length)} are shown, oldest first`
          : `${countText(r.bridges.length)} bridges, oldest first`
      }
    >
      {shown.length === 0 ? (
        <div className="empty empty--short">No bridges in the window</div>
      ) : (
        <Table head={["Trade", "Settled", ...legs.map((c) => `Unlock on ${chainName(c)}`)]}>
          {shown.map((b) => (
            <tr key={b.tradeId}>
              <td className="mono">{short(b.tradeId)}</td>
              <td className="when">{timeText(b.settledAt)}</td>
              {legs.map((c) => {
                const l = b.legs.find((x) => x.chainId === c)
                return <td key={c}>{l ? <ExternalLink href={l.explorerUrl}>{short(l.txHash)}</ExternalLink> : DASH}</td>
              })}
            </tr>
          ))}
        </Table>
      )}
      <p className="download">
        <a href={`${base}/bridges.csv`} download>
          Download all {countText(r.bridges.length)} bridges (CSV)
        </a>
      </p>
    </Section>
  )
}
