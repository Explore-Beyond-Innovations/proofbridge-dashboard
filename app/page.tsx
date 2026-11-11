import { getNetworkStats } from "@/lib/stats"
import {
  DASH,
  chainName,
  completionText,
  countText,
  disputeRows,
  disputeTotal,
  durationText,
  fillDaily,
  proveText,
  tokenAmount,
  updatedText,
  type NetworkStats,
} from "@/lib/view"

// D1: rebuilt on the server at most once a minute, matching the relayer's 60 s cache.
export const revalidate = 60

export default async function Page() {
  const stats = await getNetworkStats()

  return (
    <main className="container">
      <div className="card card--wide">
        <img src="/logo.svg" alt="ProofBridge" className="logo" />
        <h1>ProofBridge Dashboard</h1>
        <p>
          Bridges, dispute outcomes and proof times on the ProofBridge testnet,
          over the last 30 days.
        </p>
        {stats ? (
          <p className="status">Updated {updatedText(stats.generatedAt)}</p>
        ) : (
          <p className="status status--warn">Stats unavailable right now. Try again in a minute.</p>
        )}

        <div className="metrics">
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
            {stats && stats.settlement.buckets.length > 0 && (
              <ul className="rows rows--tight">
                {stats.settlement.buckets.map((b) => (
                  <li key={b.label}>
                    <span>{b.label}</span>
                    <span>{countText(b.count)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Metric>
        </div>

        <section className="panel">
          <div className="panel__head">
            <span className="metric__label">Daily bridges</span>
            <span className="metric__hint">Completed per UTC day</span>
          </div>
          {stats ? <DailyBars stats={stats} /> : <div className="empty">{DASH}</div>}
        </section>

        <div className="panels">
          <section className="panel">
            <div className="panel__head">
              <span className="metric__label">Dispute outcomes</span>
              <span className="metric__hint">
                {stats ? `${countText(disputeTotal(stats.disputes))} disputes` : "By outcome"}
              </span>
            </div>
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
          </section>

          <section className="panel">
            <div className="panel__head">
              <span className="metric__label">Volume per token</span>
              <span className="metric__hint">Settled, in each token&apos;s own units</span>
            </div>
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
          </section>
        </div>

        <p className="footer">
          Track the live bridge at{" "}
          <a href="https://app.pfbridge.xyz">app.pfbridge.xyz</a> · Read the
          docs at <a href="https://docs.pfbridge.xyz">docs.pfbridge.xyz</a> ·
          Follow on{" "}
          <a href="https://github.com/Explore-Beyond-Innovations/ProofBridge">
            GitHub
          </a>
          .
        </p>
      </div>
    </main>
  )
}

function Metric(props: { label: string; value: string; hint: string; children?: React.ReactNode }) {
  return (
    <div className="metric">
      <div className="metric__value">{props.value}</div>
      <div className="metric__label">{props.label}</div>
      <div className="metric__hint">{props.hint}</div>
      {props.children}
    </div>
  )
}

// D4: plain inline SVG, one bar per day.
function DailyBars({ stats }: { stats: NetworkStats }) {
  const days = fillDaily(stats.daily, stats.from, stats.to)
  if (days.length === 0) return <div className="empty">No bridges yet</div>
  const max = Math.max(1, ...days.map((d) => d.count))
  const w = 10
  const h = 100
  return (
    <div className="bars">
      <span className="bars__max">{countText(max)}</span>
      <svg
        viewBox={`0 0 ${days.length * w} ${h}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Completed bridges per day, ${days[0].day} to ${days[days.length - 1].day}, at most ${max} in a day`}
      >
        {days.map((d, i) => {
          const bh = d.count === 0 ? 0 : Math.max(2, (d.count / max) * h)
          return (
            <rect key={d.day} x={i * w + 1.5} y={h - bh} width={w - 3} height={bh}>
              <title>{`${d.day}: ${d.count}`}</title>
            </rect>
          )
        })}
      </svg>
      <div className="bars__axis">
        <span>{days[0].day}</span>
        <span>{days[days.length - 1].day}</span>
      </div>
    </div>
  )
}
