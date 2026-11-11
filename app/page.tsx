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
    <main className="page">
      <header className="topbar">
        <div className="brand">
          <Logo />
          <h1>ProofBridge Dashboard</h1>
        </div>
        {stats ? (
          <span className="pill">
            <span className="dot dot--ok" aria-hidden />
            Updated {updatedText(stats.generatedAt)}
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
          {stats ? <DailyBars stats={stats} /> : <div className="empty">{DASH}</div>}
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

// The app's mark (apps/frontend Logo), in currentColor so it follows the theme.
function Logo() {
  return (
    <svg className="logo" width="27" height="20.25" viewBox="0 0 36 27" fill="none" aria-hidden>
      <path fill="currentColor" d="M27.4468 0.67704H8.9423C8.85769 0.677089 8.77498 0.702122 8.70454 0.748999C8.6341 0.795876 8.57907 0.862509 8.54636 0.94054C8.51365 1.01857 8.5047 1.10453 8.52065 1.18762C8.5366 1.27071 8.57673 1.34725 8.63601 1.40762L12.6297 5.46361C12.7098 5.54411 12.7547 5.65304 12.7547 5.76658C12.7547 5.88013 12.7098 5.98905 12.6297 6.06955L0.132893 18.5385C0.0728672 18.5986 0.0319957 18.6751 0.0154421 18.7584C-0.00111156 18.8417 0.00739544 18.928 0.0398883 19.0065C0.0723811 19.085 0.127402 19.152 0.197999 19.1992C0.268596 19.2465 0.351601 19.2717 0.436528 19.2717H8.25945C8.80148 19.2722 9.33825 19.1656 9.83887 18.9578C10.3395 18.75 10.7941 18.4453 11.1765 18.0612L27.7505 1.41027C27.8105 1.35019 27.8514 1.27367 27.8679 1.19037C27.8845 1.10708 27.876 1.02074 27.8435 0.942275C27.811 0.863809 27.756 0.796735 27.6854 0.749527C27.6148 0.702318 27.5318 0.677094 27.4468 0.67704Z" />
      <path fill="currentColor" d="M7.62136 26.3229H26.1206C26.2052 26.3229 26.2879 26.2979 26.3584 26.251C26.4288 26.2041 26.4838 26.1375 26.5165 26.0594C26.5492 25.9814 26.5582 25.8955 26.5422 25.8124C26.5263 25.7293 26.4862 25.6527 26.4269 25.5924L22.4332 21.5364C22.3531 21.4559 22.3082 21.3469 22.3082 21.2334C22.3082 21.1198 22.3531 21.0109 22.4332 20.9304L34.9326 8.46678C34.9927 8.4067 35.0335 8.33018 35.0501 8.24688C35.0667 8.16358 35.0581 8.07724 35.0257 7.99878C34.9932 7.92031 34.9381 7.85324 34.8675 7.80603C34.7969 7.75882 34.7139 7.7336 34.629 7.73355H26.8061C26.2641 7.73303 25.7273 7.83972 25.2267 8.04748C24.726 8.25524 24.2715 8.55996 23.8891 8.94411L7.31507 25.595C7.25668 25.6555 7.21733 25.7318 7.20189 25.8145C7.18645 25.8971 7.1956 25.9825 7.2282 26.06C7.26081 26.1375 7.31545 26.2037 7.38533 26.2504C7.45522 26.2972 7.53728 26.3224 7.62136 26.3229Z" />
    </svg>
  )
}

function Section(props: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <div>
        <h2 className="section__title">{props.title}</h2>
        {props.subtitle && <p className="section__sub">{props.subtitle}</p>}
      </div>
      {props.children}
    </section>
  )
}

function Metric(props: { label: string; value: string; hint: string; children?: React.ReactNode }) {
  return (
    <div className="metric">
      <span className="metric__label">{props.label}</span>
      <span className="metric__value">{props.value}</span>
      <span className="metric__hint">{props.hint}</span>
      {props.children}
    </div>
  )
}

// Settlement buckets as the app's speed bars, with each bucket's count.
function SpeedBars({ buckets }: { buckets: NetworkStats["settlement"]["buckets"] }) {
  const max = Math.max(1, ...buckets.map((b) => b.count))
  return (
    <ul className="speed">
      {buckets.map((b) => (
        <li key={b.label}>
          <span className="speed__label">{b.label}</span>
          <span className="speed__track">
            <span className="speed__fill" style={{ width: `${b.count === 0 ? 0 : Math.max(2, (b.count / max) * 100)}%` }} />
          </span>
          <span className="speed__count">{countText(b.count)}</span>
        </li>
      ))}
    </ul>
  )
}

/** A rounded-up axis maximum and evenly spaced ticks (same scale as the app's trades chart). */
function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1]
  const raw = max / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw
  return Array.from({ length: count + 1 }, (_, i) => i * step)
}

// D4: plain CSS bars, one per day, no client JS.
function DailyBars({ stats }: { stats: NetworkStats }) {
  const days = fillDaily(stats.daily, stats.from, stats.to)
  if (days.length === 0) return <div className="empty">No bridges yet</div>
  const max = Math.max(0, ...days.map((d) => d.count))
  const ticks = niceTicks(max)
  const top = ticks[ticks.length - 1]
  return (
    <div className="chart">
      <div className="chart__y" aria-hidden>
        {ticks.map((t) => (
          <span key={t}>{countText(t)}</span>
        ))}
      </div>
      <div className="chart__main">
        <div
          className="chart__plot"
          role="img"
          aria-label={`Completed bridges per day, ${days[0].day} to ${days[days.length - 1].day}, at most ${max} in a day`}
        >
          {ticks.map((t) => (
            <span key={t} className="chart__grid" style={{ bottom: `${(t / top) * 100}%` }} />
          ))}
          <div className="chart__bars">
            {days.map((d) => (
              <span key={d.day} className="chart__col" title={`${d.day}: ${d.count}`}>
                <span className="chart__bar" style={{ height: `${(d.count / top) * 100}%` }} />
              </span>
            ))}
          </div>
        </div>
        <div className="chart__x">
          <span>{days[0].day}</span>
          <span>{days[days.length - 1].day}</span>
        </div>
      </div>
    </div>
  )
}
