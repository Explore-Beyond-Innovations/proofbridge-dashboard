import { DailyBars } from "@/components/charts/DailyBars"
import { Footer, SoakFooter } from "@/components/layout/Footer"
import { DisputeList } from "@/components/network/DisputeList"
import { Metric } from "@/components/ui/Metric"
import { Section } from "@/components/ui/Section"
import { Split } from "@/components/ui/Split"
import { lastInstant, timeText, windowText } from "@/lib/format/dates"
import { countText } from "@/lib/format/numbers"
import { paragraphs } from "@/lib/format/text"
import { fillDaily } from "@/lib/network/view"
import type { SoakSnapshot } from "@/lib/soak/types"
import { Bridges } from "./Bridges"
import { Disputes } from "./Disputes"
import { Incidents } from "./Incidents"
import { Operators } from "./Operators"
import { AllTimeVolume, Performance } from "./Performance"
import { Scorecard } from "./Scorecard"

// The published snapshot: intro, headline counts, then every section in report order.
export function Report({ s }: { s: SoakSnapshot }) {
  const r = s.report
  const all = r.performance.allTime
  const closed = r.disputes.filter((d) => d.closed).length
  const base = `/soak/${encodeURIComponent(s.id)}`

  return (
    <>
      <p className="intro">
        The ProofBridge testnet soak on Sepolia and Stellar testnet, {windowText(s.window.from, s.window.to)} (
        {r.window.days.toFixed(1)} days). The numbers were frozen when the report was published, and every bridge and
        dispute links to its transactions on the public explorers.
      </p>

      <div className="stats">
        <Metric label="Bridges" value={countText(r.bridges.length)} hint="Settled end to end inside the window" />
        <Metric label="Operators" value={countText(r.operators.length)} hint="Distinct makers that locked an order" />
        <Metric
          label="Disputes"
          value={countText(r.disputes.length)}
          hint={`Filed inside the window, ${countText(closed)} closed`}
        />
      </div>

      <div className="body">
        <Scorecard r={r} />
        <Operators operators={r.operators} />
        <Bridges r={r} base={base} />
        <Disputes disputes={r.disputes} closed={closed} base={base} />
        <Performance all={all} />

        <Section title="Daily bridges" subtitle="Completed per UTC day, inside the window">
          <DailyBars days={fillDaily(r.performance.daily, r.window.from, lastInstant(r.window.to))} />
        </Section>

        <Split
          left={
            <Section title="Dispute outcomes (all time)" subtitle="By outcome, from the network stats">
              <DisputeList disputes={all.disputes} />
            </Section>
          }
          right={<AllTimeVolume volume={all.volume} />}
        />

        <Incidents notes={paragraphs(s.incidents)} />

        <Footer>
          Report generated {timeText(r.generatedAt)} · Snapshot {s.id}
        </Footer>
        <SoakFooter />
      </div>
    </>
  )
}
