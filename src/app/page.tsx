import { DailyBars, Logo, Metric, Section, SpeedBars } from "@/app/components"
import { getNetworkStats } from "@/lib/api/network-stats"
import { chainName } from "@/lib/format/chains"
import { timeText } from "@/lib/format/dates"
import { completionText, countText, durationText, proveText, tokenAmount } from "@/lib/format/numbers"
import { DASH } from "@/lib/format/text"
import { disputeRows, disputeTotal, fillDaily } from "@/lib/network/view"

// D1: rebuilt on the server at most once a minute, matching the relayer's 60 s cache.
export const revalidate = 60 // NETWORK_REVALIDATE in lib/config.ts; Next needs a literal

export default async function Page() {
  const stats = await getNetworkStats()

  return (
    <main className="page">
      <header className="topbar">
        <div className="brand">
          <Logo />
          <h1>ProofBridge Dashboard</h1>
        </div>
        {stats ? (
          <span className="pill">
            <span className="dot dot--ok" aria-hidden />
            Updated {timeText(stats.generatedAt)}
          </span>
        ) : (
          <span className="pill pill--warn">
            <span className="dot dot--warn" aria-hidden />
            Stats unavailable right now. Try again in a minute.
          </span>
        )}
      </header>

      <p className="intro">
        Bridges, dispute outcomes and proof times on the ProofBridge testnet, over the last 30 days.
      </p>

      <div className="stats">
        <Metric
          label="Bridges completed"
          value={countText(stats?.trades.completed)}
          hint={
            stats
              ? `Completion rate ${completionText(stats.trades.completionRate)}, of trades that ended after the maker locked`
              : "Settled cross-chain trades, last 30 days"
          }
        />
        <Metric
          label="Proof generation"
          value={stats ? proveText(stats.proving.medianProveMs) : DASH}
          hint="Median (p50) time to generate a settlement proof"
        />
        <Metric
          label="Settlement time"
          value={stats ? durationText(stats.settlement.medianSeconds) : DASH}
          hint="Median (p50) from the maker's lock to the last leg confirmed"
        >
          {stats && stats.settlement.buckets.length > 0 && <SpeedBars buckets={stats.settlement.buckets} />}
        </Metric>
      </div>

      <div className="body">
        <Section title="Daily bridges" subtitle="Completed per UTC day">
          {stats ? <DailyBars days={fillDaily(stats.daily, stats.from, stats.to)} /> : <div className="empty">{DASH}</div>}
        </Section>

        <div className="split">
          <div className="split__col">
            <Section
              title="Dispute outcomes"
              subtitle={stats ? `${countText(disputeTotal(stats.disputes))} disputes` : "By outcome"}
            >
              <ul className="rows">
                {stats ? (
                  disputeRows(stats.disputes).map((r) => (
                    <li key={r.label} className={r.count === 0 ? "rows__zero" : undefined}>
                      <span>{r.label}</span>
                      <span>{countText(r.count)}</span>
                    </li>
                  ))
                ) : (
                  <li>
                    <span>{DASH}</span>
                  </li>
                )}
              </ul>
            </Section>
          </div>

          <div className="split__col">
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
          </div>
        </div>

        <p className="footer">
          Track the live bridge at <a href="https://app.pfbridge.xyz">app.pfbridge.xyz</a> · Read the docs at{" "}
          <a href="https://docs.pfbridge.xyz">docs.pfbridge.xyz</a> · Follow on{" "}
          <a href="https://github.com/Explore-Beyond-Innovations/ProofBridge">GitHub</a>.
        </p>
      </div>
    </main>
  )
}
