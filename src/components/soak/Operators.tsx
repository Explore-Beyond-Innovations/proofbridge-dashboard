import { ExternalLink } from "@/components/ui/ExternalLink"
import { Section } from "@/components/ui/Section"
import { Table } from "@/components/ui/Table"
import { chainName } from "@/lib/format/chains"
import { timeText } from "@/lib/format/dates"
import { addressUrl } from "@/lib/format/explorer"
import { countText } from "@/lib/format/numbers"
import { short } from "@/lib/format/text"
import { accountText } from "@/lib/soak/labels"
import type { SoakOperator } from "@/lib/soak/types"

export function Operators({ operators }: { operators: SoakOperator[] }) {
  return (
    <Section title="Operators" subtitle={`${countText(operators.length)} ${operators.length === 1 ? "maker" : "makers"} locked orders in the window`}>
      {operators.length === 0 ? (
        <div className="empty empty--short">No operators in the window</div>
      ) : (
        <Table head={["Maker", "Chain", "Locks", "First lock", "Account"]}>
          {operators.map((o) => (
            <tr key={`${o.chainId}:${o.identity}`}>
              <td>
                <ExternalLink href={addressUrl(o.identity, o.chainId)}>{short(o.identity)}</ExternalLink>
              </td>
              <td>{chainName(o.chainId, o.chainName)}</td>
              <td className="num">{countText(o.locks)}</td>
              <td>
                <ExternalLink href={o.firstLockUrl}>{short(o.firstLockTx)}</ExternalLink>
                <span className="rows__sub when"> {timeText(o.firstLockAt)}</span>
              </td>
              <td>{accountText(o)}</td>
            </tr>
          ))}
        </Table>
      )}
    </Section>
  )
}
