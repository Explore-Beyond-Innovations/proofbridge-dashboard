import { ExternalLink } from "@/components/ui/ExternalLink"
import { Section } from "@/components/ui/Section"
import { Table } from "@/components/ui/Table"
import { dayText } from "@/lib/format/dates"
import { addressUrl, chainOfAddress } from "@/lib/format/explorer"
import { countText } from "@/lib/format/numbers"
import { DASH, kindText, short } from "@/lib/format/text"
import { outcomeLabel, roleText } from "@/lib/soak/labels"
import type { SoakDispute } from "@/lib/soak/types"

export function Disputes({ disputes, closed, base }: { disputes: SoakDispute[]; closed: number; base: string }) {
  return (
    <Section
      title="Disputes"
      subtitle={`${countText(disputes.length)} filed in the window, ${countText(closed)} closed`}
    >
      {disputes.length === 0 ? (
        <div className="empty empty--short">No disputes in the window</div>
      ) : (
        <Table head={["Case", "Filed", "Filed by", "Outcome", "Closed", "Transactions"]}>
          {disputes.map((d) => {
            const chain = d.filer ? chainOfAddress(d.filer) : null
            return (
              <tr key={d.caseId}>
                <td className="mono">{short(d.caseId)}</td>
                <td className="when">{dayText(d.filedAt)}</td>
                <td>
                  {roleText(d.filerRole)}
                  {d.filer && (
                    <>
                      {" "}
                      <ExternalLink href={chain ? addressUrl(d.filer, chain) : null}>{short(d.filer)}</ExternalLink>
                    </>
                  )}
                </td>
                <td>{outcomeLabel(d)}</td>
                <td className="when">{d.closedAt ? dayText(d.closedAt) : DASH}</td>
                <td>
                  {d.txs.length === 0 ? (
                    DASH
                  ) : (
                    <ul className="txs">
                      {d.txs.map((t) => (
                        <li key={`${t.chainId}:${t.txHash}:${t.kind}`}>
                          {kindText(t.kind)} <ExternalLink href={t.explorerUrl}>{short(t.txHash)}</ExternalLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
              </tr>
            )
          })}
        </Table>
      )}
      <p className="download">
        <a href={`${base}/disputes.csv`} download>
          Download the disputes (CSV)
        </a>
      </p>
    </Section>
  )
}
