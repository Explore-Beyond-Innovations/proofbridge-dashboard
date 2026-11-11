import { Section } from "@/components/ui/Section"
import { Table } from "@/components/ui/Table"
import { metLabel } from "@/lib/soak/labels"
import type { SoakReport } from "@/lib/soak/types"

// The exit criteria with Met / Not met / Check by hand, then the report's definitions.
export function Scorecard({ r }: { r: SoakReport }) {
  return (
    <Section title="Scorecard" subtitle="The soak's exit criteria">
      <Table head={["Criterion", "Target", "Result", "Status"]}>
        {r.scorecard.map((c) => {
          const m = metLabel(c.met)
          return (
            <tr key={c.criterion}>
              <td>{c.criterion}</td>
              <td>{c.target}</td>
              <td>{c.result}</td>
              <td>
                <span className={`tag tag--${m.tone}`}>{m.text}</span>
              </td>
            </tr>
          )
        })}
      </Table>
      <dl className="defs">
        <dt>Operator</dt>
        <dd>{r.definitions.operator}</dd>
        <dt>Bridge</dt>
        <dd>{r.definitions.bridge}</dd>
        <dt>Dispute lifecycle</dt>
        <dd>{r.definitions.disputeLifecycle}</dd>
      </dl>
    </Section>
  )
}
