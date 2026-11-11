import { countText } from "@/lib/format/numbers"
import type { NetworkStats } from "@/lib/network/types"

// Settlement buckets as the app's speed bars, with each bucket's count.
export function SpeedBars({ buckets }: { buckets: NetworkStats["settlement"]["buckets"] }) {
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
