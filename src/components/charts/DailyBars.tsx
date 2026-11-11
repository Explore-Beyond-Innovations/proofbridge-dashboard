import { countText } from "@/lib/format/numbers"
import { niceTicks } from "./niceTicks"

// D4: plain CSS bars, one per day, no client JS.
export function DailyBars({ days, label = "Completed bridges per day" }: { days: { day: string; count: number }[]; label?: string }) {
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
          aria-label={`${label}, ${days[0].day} to ${days[days.length - 1].day}, at most ${max} in a day`}
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
